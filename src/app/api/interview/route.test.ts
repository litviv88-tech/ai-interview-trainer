import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/openai", () => ({
  generateQuestion: vi.fn(),
  evaluateAnswer: vi.fn(),
  evaluateQuizAnswer: vi.fn(),
  finalizeSession: vi.fn(),
}));

import {
  evaluateAnswer,
  evaluateQuizAnswer,
  generateQuestion,
} from "@/lib/openai";
import { POST as postQuestion } from "@/app/api/interview/question/route";
import { POST as postEvaluate } from "@/app/api/interview/evaluate/route";
import { MAX_ANSWER_LENGTH } from "@/lib/constants";

describe("API /api/interview/question", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("возвращает 400 без обязательных полей", async () => {
    const response = await postQuestion(
      new Request("http://localhost/api/interview/question", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringMatching(/параметров/i),
    });
  });

  it("возвращает вопрос при успехе", async () => {
    vi.mocked(generateQuestion).mockResolvedValue({
      question: "Что такое алгоритм?",
    });

    const response = await postQuestion(
      new Request("http://localhost/api/interview/question", {
        method: "POST",
        body: JSON.stringify({
          topicId: "informatics",
          difficulty: "easy",
          grade: 8,
          mode: "classic",
          questionNumber: 1,
          previousRounds: [],
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      question: "Что такое алгоритм?",
    });
  });

  it("возвращает вопрос викторины с вариантами", async () => {
    vi.mocked(generateQuestion).mockResolvedValue({
      question: "Сколько бит в байте?",
      options: ["4", "8", "16", "32"],
      correctIndex: 1,
    });

    const response = await postQuestion(
      new Request("http://localhost/api/interview/question", {
        method: "POST",
        body: JSON.stringify({
          topicId: "informatics",
          difficulty: "easy",
          grade: 7,
          mode: "quiz",
          questionNumber: 1,
          previousRounds: [],
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      question: "Сколько бит в байте?",
      options: ["4", "8", "16", "32"],
      correctIndex: 1,
    });
  });

  it("возвращает 502 при ошибке AI", async () => {
    vi.mocked(generateQuestion).mockRejectedValue(new Error("AI down"));

    const response = await postQuestion(
      new Request("http://localhost/api/interview/question", {
        method: "POST",
        body: JSON.stringify({
          topicId: "math",
          difficulty: "medium",
          grade: 9,
          mode: "classic",
          questionNumber: 2,
        }),
      }),
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ error: "AI down" });
  });
});

describe("API /api/interview/evaluate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("отклоняет пустой ответ", async () => {
    const response = await postEvaluate(
      new Request("http://localhost/api/interview/evaluate", {
        method: "POST",
        body: JSON.stringify({
          topicId: "informatics",
          difficulty: "easy",
          grade: 7,
          mode: "classic",
          question: "Что такое переменная?",
          answer: "   ",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringMatching(/пустым/i),
    });
    expect(evaluateAnswer).not.toHaveBeenCalled();
  });

  it("отклоняет слишком длинный ответ", async () => {
    const response = await postEvaluate(
      new Request("http://localhost/api/interview/evaluate", {
        method: "POST",
        body: JSON.stringify({
          topicId: "informatics",
          difficulty: "easy",
          grade: 7,
          mode: "classic",
          question: "Вопрос",
          answer: "x".repeat(MAX_ANSWER_LENGTH + 10),
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.stringMatching(/длинный/i),
    });
  });

  it("возвращает оценку при валидном ответе", async () => {
    vi.mocked(evaluateAnswer).mockResolvedValue({
      isCorrect: false,
      score: 0,
      feedback: "Неверно: переменная хранит значение, а не файл.",
      mistakes: "Путаница терминов",
      whatToReview: "Переменные и типы данных",
    });

    const response = await postEvaluate(
      new Request("http://localhost/api/interview/evaluate", {
        method: "POST",
        body: JSON.stringify({
          topicId: "informatics",
          difficulty: "easy",
          grade: 8,
          mode: "classic",
          question: "Что такое переменная?",
          answer: "Это файл на диске",
        }),
      }),
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.evaluation.isCorrect).toBe(false);
    expect(data.evaluation.score).toBe(0);
  });

  it("проверяет ответ викторины локально", async () => {
    vi.mocked(evaluateQuizAnswer).mockReturnValue({
      isCorrect: true,
      score: 2,
      feedback: "Верно. Выбран правильный вариант.",
      mistakes: "нет критических ошибок",
      whatToReview: "Можно переходить к следующей теме.",
    });

    const response = await postEvaluate(
      new Request("http://localhost/api/interview/evaluate", {
        method: "POST",
        body: JSON.stringify({
          mode: "quiz",
          question: "Сколько бит в байте?",
          options: ["4", "8", "16", "32"],
          correctIndex: 1,
          selectedIndex: 1,
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(evaluateQuizAnswer).toHaveBeenCalledWith({
      options: ["4", "8", "16", "32"],
      correctIndex: 1,
      selectedIndex: 1,
    });
    expect(evaluateAnswer).not.toHaveBeenCalled();
  });
});
