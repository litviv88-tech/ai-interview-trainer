"use client";

import { GRADES, MODES, TOPICS } from "@/lib/constants";
import type { Difficulty, Grade, InterviewMode, TopicId } from "@/lib/types";
import { DifficultyPicker } from "./DifficultyPicker";
import { LoadingIndicator } from "./LoadingIndicator";

type SetupScreenProps = {
  topicId: TopicId;
  difficulty: Difficulty;
  grade: Grade;
  mode: InterviewMode;
  loading: boolean;
  error: string | null;
  onTopicChange: (topicId: TopicId) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onGradeChange: (grade: Grade) => void;
  onModeChange: (mode: InterviewMode) => void;
  onBack: () => void;
  onSubmit: () => void;
};

export function SetupScreen({
  topicId,
  difficulty,
  grade,
  mode,
  loading,
  error,
  onTopicChange,
  onDifficultyChange,
  onGradeChange,
  onModeChange,
  onBack,
  onSubmit,
}: SetupScreenProps) {
  return (
    <section className="panel rise-in px-6 py-8 sm:px-10">
      <h2 className="brand text-3xl">Режим, тема и класс</h2>
      <p className="muted mt-2">
        Выберите формат теста, предмет, класс и уровень сложности.
      </p>

      <div className="mt-8">
        <label className="mb-3 block text-sm font-bold uppercase tracking-wide">
          Режим
        </label>
        <div className="mode-grid">
          {MODES.map((item) => {
            const active = item.id === mode;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => onModeChange(item.id)}
                className={`mode-btn ${active ? "is-active" : ""}`}
              >
                <div className="font-bold">{item.label}</div>
                <div className="muted mt-1 text-sm">{item.hint}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <label className="mb-3 block text-sm font-bold uppercase tracking-wide">
          Класс
        </label>
        <div className="grade-grid">
          {GRADES.map((item) => {
            const active = item === grade;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => onGradeChange(item)}
                className={`grade-btn ${active ? "is-active" : ""}`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <label className="mb-3 block text-sm font-bold uppercase tracking-wide">
          Тема
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          {TOPICS.map((topic) => {
            const active = topic.id === topicId;
            return (
              <button
                key={topic.id}
                type="button"
                aria-pressed={active}
                onClick={() => onTopicChange(topic.id)}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  active
                    ? "border-[var(--accent)] bg-[rgba(31,138,112,0.12)]"
                    : "border-[var(--line)] bg-[var(--card)] hover:border-[rgba(31,138,112,0.4)]"
                }`}
              >
                <div className="font-bold">{topic.title}</div>
                <div className="muted mt-1 text-sm">{topic.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <label className="mb-3 block text-sm font-bold uppercase tracking-wide">
          Уровень сложности
        </label>
        <DifficultyPicker value={difficulty} onChange={onDifficultyChange} />
      </div>

      {error ? <div className="error-box mt-6">{error}</div> : null}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button type="button" className="ghost-btn" onClick={onBack} disabled={loading}>
          Назад
        </button>
        <button
          type="button"
          className="primary-btn inline-flex items-center gap-3"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? <LoadingIndicator label="Готовлю первый вопрос…" /> : "Начать вопросы"}
        </button>
      </div>
    </section>
  );
}
