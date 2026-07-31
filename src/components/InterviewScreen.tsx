"use client";

import { MAX_ANSWER_LENGTH, TOTAL_QUESTIONS } from "@/lib/constants";
import type { Difficulty } from "@/lib/types";
import { LoadingIndicator } from "./LoadingIndicator";

const BADGE_CLASS: Record<Difficulty, string> = {
  easy: "difficulty-easy is-active",
  medium: "difficulty-medium is-active",
  hard: "difficulty-hard is-active",
};

const BADGE_LABEL: Record<Difficulty, string> = {
  easy: "Лёгкий",
  medium: "Средний",
  hard: "Сложный",
};

type InterviewScreenProps = {
  topicTitle: string;
  difficulty: Difficulty;
  questionNumber: number;
  question: string;
  answer: string;
  loading: boolean;
  error: string | null;
  lastFeedback: string | null;
  onAnswerChange: (value: string) => void;
  onSubmit: () => void;
};

export function InterviewScreen({
  topicTitle,
  difficulty,
  questionNumber,
  question,
  answer,
  loading,
  error,
  lastFeedback,
  onAnswerChange,
  onSubmit,
}: InterviewScreenProps) {
  return (
    <section className="panel rise-in px-6 py-8 sm:px-10">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-sm font-semibold">
          {topicTitle}
        </span>
        <span
          className={`rounded-full border px-3 py-1 text-sm font-bold ${BADGE_CLASS[difficulty]}`}
        >
          {BADGE_LABEL[difficulty]}
        </span>
        <span className="muted text-sm font-semibold">
          Вопрос {questionNumber} из {TOTAL_QUESTIONS}
        </span>
      </div>

      <h2 className="brand mt-6 text-2xl leading-snug sm:text-3xl">{question}</h2>

      {lastFeedback ? (
        <div className="mt-5 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm leading-relaxed">
          <strong>Разбор предыдущего ответа:</strong> {lastFeedback}
        </div>
      ) : null}

      <label className="mt-6 block text-sm font-bold uppercase tracking-wide">
        Ваш ответ
      </label>
      <textarea
        className="field mt-3"
        value={answer}
        onChange={(event) => onAnswerChange(event.target.value)}
        placeholder="Напишите ответ своими словами…"
        disabled={loading}
        maxLength={MAX_ANSWER_LENGTH + 100}
      />
      <div className="muted mt-2 text-sm">
        {answer.trim().length}/{MAX_ANSWER_LENGTH} символов
        {answer.trim().length > MAX_ANSWER_LENGTH
          ? " — слишком длинный текст"
          : ""}
      </div>

      {error ? (
        <div className="error-box mt-4" role="alert">
          {error}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="primary-btn inline-flex items-center gap-3"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? (
            <LoadingIndicator label="Проверяю и готовлю следующий вопрос…" />
          ) : (
            "Отправить ответ"
          )}
        </button>
      </div>
    </section>
  );
}
