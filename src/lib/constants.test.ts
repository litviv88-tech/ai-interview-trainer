import { describe, expect, it } from "vitest";
import {
  DIFFICULTIES,
  GRADES,
  HISTORY_LIMIT,
  MAX_ANSWER_LENGTH,
  MODES,
  TOTAL_QUESTIONS,
  TOPICS,
  formatDuration,
} from "@/lib/constants";

describe("constants", () => {
  it("задаёт 5 вопросов в тренировке", () => {
    expect(TOTAL_QUESTIONS).toBe(5);
  });

  it("ограничивает длину ответа и историю", () => {
    expect(MAX_ANSWER_LENGTH).toBe(2000);
    expect(HISTORY_LIMIT).toBe(5);
  });

  it("содержит классы 5–11", () => {
    expect(GRADES).toEqual([5, 6, 7, 8, 9, 10, 11]);
  });

  it("содержит 7 тем, 3 уровня сложности и 2 режима", () => {
    expect(TOPICS).toHaveLength(7);
    expect(DIFFICULTIES.map((item) => item.id)).toEqual([
      "easy",
      "medium",
      "hard",
    ]);
    expect(MODES.map((item) => item.id)).toEqual(["classic", "quiz"]);
  });

  it("темы имеют уникальные id", () => {
    const ids = TOPICS.map((topic) => topic.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("форматирует длительность", () => {
    expect(formatDuration(5000)).toBe("00:05");
    expect(formatDuration(125000)).toBe("02:05");
    expect(formatDuration(3723000)).toBe("1:02:03");
  });
});
