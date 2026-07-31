import { beforeEach, describe, expect, it } from "vitest";
import { HISTORY_LIMIT, STORAGE_KEY } from "@/lib/constants";
import { loadHistory, saveResult } from "@/lib/storage";
import type { SessionResult } from "@/lib/types";

function makeResult(id: string): SessionResult {
  return {
    id,
    date: "01.01.2026",
    topicId: "informatics",
    topicTitle: "Информатика",
    difficulty: "easy",
    grade: 8,
    mode: "classic",
    durationMs: 125000,
    correctCount: 3,
    totalQuestions: 5,
    totalScore: 7,
    briefReview: "Нужно повторить основы",
    recommendations: ["Алгоритмы", "Типы данных"],
  };
}

describe("storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("возвращает пустую историю, если ничего нет", () => {
    expect(loadHistory()).toEqual([]);
  });

  it("сохраняет результат и читает его обратно", () => {
    const saved = saveResult(makeResult("1"));
    expect(saved).toHaveLength(1);
    expect(loadHistory()[0]?.id).toBe("1");
    expect(window.localStorage.getItem(STORAGE_KEY)).toContain('"id":"1"');
  });

  it("хранит не больше HISTORY_LIMIT последних результатов", () => {
    for (let i = 1; i <= HISTORY_LIMIT + 3; i += 1) {
      saveResult(makeResult(String(i)));
    }

    const history = loadHistory();
    expect(history).toHaveLength(HISTORY_LIMIT);
    expect(history[0]?.id).toBe(String(HISTORY_LIMIT + 3));
    expect(history.at(-1)?.id).toBe("4");
  });

  it("не падает на битом JSON в localStorage", () => {
    window.localStorage.setItem(STORAGE_KEY, "{broken");
    expect(loadHistory()).toEqual([]);
  });

  it("подставляет classic для старых записей без mode", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: "old",
          date: "01.01.2026",
          topicId: "math",
          topicTitle: "Математика",
          difficulty: "easy",
          grade: 6,
          correctCount: 2,
          totalQuestions: 5,
          totalScore: 4,
          briefReview: "ok",
          recommendations: [],
        },
      ]),
    );

    expect(loadHistory()[0]?.mode).toBe("classic");
  });
});
