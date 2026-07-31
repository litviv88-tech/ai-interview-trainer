"use client";

import type { SessionResult } from "@/lib/types";

type ResultsScreenProps = {
  result: SessionResult;
  history: SessionResult[];
  onRestart: () => void;
};

export function ResultsScreen({
  result,
  history,
  onRestart,
}: ResultsScreenProps) {
  return (
    <section className="panel rise-in px-6 py-8 sm:px-10">
      <h2 className="brand text-3xl">Итоги тренировки</h2>
      <p className="muted mt-2">
        Строгая оценка без «зачёта» за неверные ответы.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card rounded-2xl p-4">
          <div className="muted text-sm">Правильных ответов</div>
          <div className="mt-2 text-3xl font-bold">
            {result.correctCount}/{result.totalQuestions}
          </div>
        </div>
        <div className="card rounded-2xl p-4">
          <div className="muted text-sm">Оценка</div>
          <div className="mt-2 text-3xl font-bold">{result.totalScore}/10</div>
        </div>
        <div className="card rounded-2xl p-4">
          <div className="muted text-sm">Тема</div>
          <div className="mt-2 text-lg font-bold">{result.topicTitle}</div>
        </div>
      </div>

      <div className="card mt-6 rounded-2xl p-5">
        <h3 className="text-lg font-bold">Краткий разбор</h3>
        <p className="mt-2 leading-relaxed">{result.briefReview}</p>
      </div>

      <div className="card mt-4 rounded-2xl p-5">
        <h3 className="text-lg font-bold">Что повторить</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          {result.recommendations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold">Последние результаты</h3>
        <div className="mt-3 space-y-3">
          {history.length === 0 ? (
            <p className="muted text-sm">История пока пуста.</p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="card flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm"
              >
                <span className="font-semibold">
                  {item.topicTitle} · {item.date}
                </span>
                <span>
                  {item.correctCount}/{item.totalQuestions} · {item.totalScore}/10
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-8">
        <button type="button" className="primary-btn" onClick={onRestart}>
          Пройти ещё раз
        </button>
      </div>
    </section>
  );
}
