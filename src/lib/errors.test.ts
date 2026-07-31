import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  AppError,
  assertOnline,
  mapApiError,
  validateAnswer,
} from "@/lib/errors";
import { MAX_ANSWER_LENGTH } from "@/lib/constants";

describe("validateAnswer", () => {
  it("принимает нормальный ответ и обрезает пробелы", () => {
    expect(validateAnswer("  Алгоритм — это шаги  ")).toBe(
      "Алгоритм — это шаги",
    );
  });

  it("отклоняет пустой ответ", () => {
    expect(() => validateAnswer("   ")).toThrow(AppError);
    expect(() => validateAnswer("")).toThrow(/пустым/i);
  });

  it("отклоняет слишком длинный текст", () => {
    const longText = "а".repeat(MAX_ANSWER_LENGTH + 1);
    expect(() => validateAnswer(longText)).toThrow(/Слишком длинный/i);
  });

  it("принимает ответ ровно на лимите", () => {
    const exact = "б".repeat(MAX_ANSWER_LENGTH);
    expect(validateAnswer(exact)).toHaveLength(MAX_ANSWER_LENGTH);
  });
});

describe("assertOnline", () => {
  const original = globalThis.navigator;

  afterEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      value: original,
      configurable: true,
    });
  });

  it("не бросает ошибку, если сеть есть", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { onLine: true },
      configurable: true,
    });
    expect(() => assertOnline()).not.toThrow();
  });

  it("бросает offline-ошибку без сети", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { onLine: false },
      configurable: true,
    });
    expect(() => assertOnline()).toThrow(/интернет/i);
  });
});

describe("mapApiError", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      value: { onLine: true },
      configurable: true,
    });
  });

  it("возвращает сообщение AppError", () => {
    expect(mapApiError(new AppError("empty", "Пусто"))).toBe("Пусто");
  });

  it("распознаёт TypeError как сетевую ошибку", () => {
    expect(mapApiError(new TypeError("Failed to fetch"))).toMatch(/сервером/i);
  });

  it("распознаёт ошибку API ключа", () => {
    expect(mapApiError(new Error("Invalid api key"))).toMatch(/OPENAI_API_KEY/i);
  });

  it("возвращает сообщение Error как есть", () => {
    expect(mapApiError(new Error("Кастомная ошибка"))).toBe("Кастомная ошибка");
  });

  it("возвращает offline-сообщение, если сеть пропала", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: { onLine: false },
      configurable: true,
    });
    expect(mapApiError(new Error("whatever"))).toMatch(/интернет/i);
  });
});
