"use client";

import { formatDuration, TIMER_STORAGE_KEY } from "@/lib/constants";

type TimerDockProps = {
  enabled: boolean;
  running: boolean;
  elapsedMs: number;
  /** Переключатель доступен только в главном меню */
  editable: boolean;
  onToggle: (enabled: boolean) => void;
};

export function TimerDock({
  enabled,
  running,
  elapsedMs,
  editable,
  onToggle,
}: TimerDockProps) {
  function handleToggle() {
    if (!editable) return;
    const next = !enabled;
    onToggle(next);
    try {
      window.localStorage.setItem(TIMER_STORAGE_KEY, next ? "on" : "off");
    } catch {
      // ignore
    }
  }

  return (
    <div className="timer-dock" aria-live="polite">
      <div className="timer-dock__label">Таймер</div>
      <div className="timer-dock__time">
        {enabled
          ? editable
            ? "включён"
            : formatDuration(elapsedMs)
          : "выкл"}
      </div>
      {editable ? (
        <button
          type="button"
          className={`timer-dock__switch ${enabled ? "is-on" : ""}`}
          aria-pressed={enabled}
          onClick={handleToggle}
        >
          {enabled ? "Выключить" : "Включить"}
        </button>
      ) : enabled ? (
        <div className="timer-dock__status">
          {running ? "идёт" : elapsedMs > 0 ? "пауза" : "готов"}
        </div>
      ) : null}
    </div>
  );
}
