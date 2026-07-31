import { describe, expect, it } from "vitest";
import {
  DIFFICULTIES,
  HISTORY_LIMIT,
  MAX_ANSWER_LENGTH,
  TOTAL_QUESTIONS,
  TOPICS,
} from "@/lib/constants";

describe("constants", () => {
  it("задаёт 5 вопросов в тренировке", () => {
    expect(TOTAL_QUESTIONS).toBe(5);
  });

  it("ограничивает длину ответа и историю", () => {
    expect(MAX_ANSWER_LENGTH).toBe(2000);
    expect(HISTORY_LIMIT).toBe(5);
  });

  it("содержит 6 тем и 3 уровня сложности", () => {
    expect(TOPICS).toHaveLength(6);
    expect(DIFFICULTIES.map((item) => item.id)).toEqual([
      "easy",
      "medium",
      "hard",
    ]);
  });

  it("темы имеют уникальные id", () => {
    const ids = TOPICS.map((topic) => topic.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
