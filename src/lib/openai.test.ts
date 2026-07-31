import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  evaluateAnswer,
  evaluateQuizAnswer,
  finalizeSession,
  generateQuestion,
} from "@/lib/openai";

function mockChatResponse(payload: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(payload),
  });
}

describe("evaluateQuizAnswer", () => {
  const options = ["4", "8", "16", "32"];

  it("засчитывает верный вариант", () => {
    const result = evaluateQuizAnswer({
      options,
      correctIndex: 1,
      selectedIndex: 1,
    });
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(2);
    expect(result.feedback).toMatch(/Верно/i);
  });

  it("отклоняет неверный вариант и показывает правильный", () => {
    const result = evaluateQuizAnswer({
      options,
      correctIndex: 1,
      selectedIndex: 0,
    });
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(0);
    expect(result.feedback).toContain("8");
    expect(result.mistakes).toContain("4");
  });
});

describe("openai API helpers", () => {
  const originalFetch = globalThis.fetch;
  const env = process.env;

  beforeEach(() => {
    process.env = {
      ...env,
      OPENROUTER_API_KEY: "sk-test-key",
      OPENAI_BASE_URL: "https://openrouter.ai/api/v1",
    };
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env = env;
    vi.restoreAllMocks();
  });

  it("бросает ошибку без API-ключа", async () => {
    process.env.OPENROUTER_API_KEY = "";
    process.env.OPENAI_API_KEY = "";
    await expect(
      generateQuestion({
        topicId: "math",
        difficulty: "easy",
        grade: 7,
        mode: "classic",
        questionNumber: 1,
        previousRounds: [],
      }),
    ).rejects.toThrow(/OPENROUTER_API_KEY/i);
  });

  it("генерирует классический вопрос", async () => {
    globalThis.fetch = mockChatResponse({
      choices: [{ message: { content: JSON.stringify({ question: "Что такое дробь?" }) } }],
    });

    await expect(
      generateQuestion({
        topicId: "math",
        difficulty: "easy",
        grade: 6,
        mode: "classic",
        questionNumber: 1,
        previousRounds: [],
      }),
    ).resolves.toEqual({ question: "Что такое дробь?" });
  });

  it("генерирует вопрос викторины с 4 вариантами", async () => {
    globalThis.fetch = mockChatResponse({
      choices: [
        {
          message: {
            content: JSON.stringify({
              question: "Столица Великобритании?",
              options: ["Париж", "Лондон", "Рим", "Берлин"],
              correctIndex: 1,
            }),
          },
        },
      ],
    });

    await expect(
      generateQuestion({
        topicId: "english",
        difficulty: "easy",
        grade: 8,
        mode: "quiz",
        questionNumber: 1,
        previousRounds: [],
      }),
    ).resolves.toEqual({
      question: "Столица Великобритании?",
      options: ["Париж", "Лондон", "Рим", "Берлин"],
      correctIndex: 1,
    });
  });

  it("отклоняет викторину с неверным correctIndex", async () => {
    globalThis.fetch = mockChatResponse({
      choices: [
        {
          message: {
            content: JSON.stringify({
              question: "Вопрос?",
              options: ["A", "B", "C", "D"],
              correctIndex: 9,
            }),
          },
        },
      ],
    });

    await expect(
      generateQuestion({
        topicId: "biology",
        difficulty: "medium",
        grade: 9,
        mode: "quiz",
        questionNumber: 2,
        previousRounds: [],
      }),
    ).rejects.toThrow(/правильный вариант/i);
  });

  it("оценивает текстовый ответ", async () => {
    globalThis.fetch = mockChatResponse({
      choices: [
        {
          message: {
            content: JSON.stringify({
              isCorrect: true,
              score: 2,
              feedback: "Верно.",
              mistakes: "нет критических ошибок",
              whatToReview: "Можно идти дальше",
            }),
          },
        },
      ],
    });

    const result = await evaluateAnswer({
      topicId: "history",
      difficulty: "hard",
      grade: 10,
      question: "Когда была Куликовская битва?",
      answer: "1380 год",
    });

    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(2);
  });

  it("собирает итоги сессии", async () => {
    globalThis.fetch = mockChatResponse({
      choices: [
        {
          message: {
            content: JSON.stringify({
              briefReview: "Нужно повторить даты.",
              recommendations: ["Даты", "Причины", "Итоги"],
              nextFocus: "Средневековье",
            }),
          },
        },
      ],
    });

    const summary = await finalizeSession({
      topicId: "history",
      difficulty: "medium",
      rounds: [
        {
          questionNumber: 1,
          question: "Вопрос 1",
          answer: "Ответ",
          evaluation: {
            isCorrect: true,
            score: 2,
            feedback: "ok",
            mistakes: "нет",
            whatToReview: "нет",
          },
        },
        {
          questionNumber: 2,
          question: "Вопрос 2",
          answer: "Ответ",
          evaluation: {
            isCorrect: false,
            score: 0,
            feedback: "нет",
            mistakes: "ошибка",
            whatToReview: "даты",
          },
        },
      ],
    });

    expect(summary.correctCount).toBe(1);
    expect(summary.briefReview).toMatch(/даты/i);
    expect(summary.recommendations).toHaveLength(3);
  });

  it("пробрасывает ошибку AI API", async () => {
    globalThis.fetch = mockChatResponse(
      { error: { message: "quota exceeded" } },
      429,
    );

    await expect(
      generateQuestion({
        topicId: "informatics",
        difficulty: "easy",
        grade: 8,
        mode: "classic",
        questionNumber: 1,
        previousRounds: [],
      }),
    ).rejects.toThrow(/429/);
  });
});
