import { MAX_ANSWER_LENGTH } from "./constants";

export class AppError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "AppError";
  }
}

export function assertOnline() {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new AppError(
      "offline",
      "Нет интернет-соединения. Проверьте сеть и попробуйте снова.",
    );
  }
}

export function validateAnswer(answer: string) {
  const trimmed = answer.trim();

  if (!trimmed) {
    throw new AppError(
      "empty",
      "Ответ не может быть пустым. Напишите хотя бы короткое объяснение.",
    );
  }

  if (trimmed.length > MAX_ANSWER_LENGTH) {
    throw new AppError(
      "too_long",
      `Слишком длинный текст (${trimmed.length} символов). Сократите ответ до ${MAX_ANSWER_LENGTH}.`,
    );
  }

  return trimmed;
}

export function mapApiError(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return "Нет интернет-соединения. Проверьте сеть и попробуйте снова.";
  }

  if (error instanceof TypeError) {
    return "Не удалось связаться с сервером. Проверьте интернет-соединение.";
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("openai") || message.includes("api key")) {
      return "Ошибка OpenAI API. Проверьте ключ OPENAI_API_KEY и лимиты аккаунта.";
    }
    if (error.message) {
      return error.message;
    }
  }

  return "Произошла непредвиденная ошибка. Попробуйте ещё раз.";
}
