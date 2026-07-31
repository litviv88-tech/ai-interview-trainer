"use client";

type StartScreenProps = {
  onStart: () => void;
};

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <section className="panel rise-in overflow-hidden">
      <div className="relative px-6 py-10 sm:px-10 sm:py-14">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[var(--easy)] via-[var(--medium)] to-[var(--hard)]" />
        <p className="muted text-sm font-semibold uppercase tracking-[0.18em]">
          Школьный тренажёр
        </p>
        <h1 className="brand mt-3 max-w-2xl text-4xl leading-tight text-[var(--ink)] sm:text-5xl">
          AI-тренажёр собеседований для школьника
        </h1>
        <p className="muted mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
          Пять вопросов, строгая проверка ответов и понятные рекомендации —
          без мягких оценок за неверные формулировки.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" className="primary-btn" onClick={onStart}>
            Начать тренировку
          </button>
        </div>
      </div>
    </section>
  );
}
