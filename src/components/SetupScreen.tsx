"use client";

import { TOPICS } from "@/lib/constants";
import type { Difficulty, TopicId } from "@/lib/types";
import { DifficultyPicker } from "./DifficultyPicker";
import { LoadingIndicator } from "./LoadingIndicator";

type SetupScreenProps = {
  topicId: TopicId;
  difficulty: Difficulty;
  loading: boolean;
  error: string | null;
  onTopicChange: (topicId: TopicId) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onBack: () => void;
  onSubmit: () => void;
};

export function SetupScreen({
  topicId,
  difficulty,
  loading,
  error,
  onTopicChange,
  onDifficultyChange,
  onBack,
  onSubmit,
}: SetupScreenProps) {
  return (
    <section className="panel rise-in px-6 py-8 sm:px-10">
      <h2 className="brand text-3xl">Тема и сложность</h2>
      <p className="muted mt-2">
        Выберите предмет и уровень. Цвет уровня сохраняется на всём пути
        тренировки.
      </p>

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
