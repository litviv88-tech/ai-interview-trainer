"use client";

import { formatDuration, TIMER_STORAGE_KEY } from "@/lib/constants";

type TimerDockProps = {
  enabled: boolean;
  running: boolean;
  elapsedMs: number;
  onToggle: (enabled: boolean) => void;
};

export function TimerDock({
  enabled,
  running,
  elapsedMs,
  onToggle,
}: TimerDockProps) {
  function handleToggle() {
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
        {enabled ? formatDuration(elapsedMs) : "выкл"}
      </div>
      <button
        type="button"
        className={`timer-dock__switch ${enabled ? "is-on" : ""}`}
        aria-pressed={enabled}
        onClick={handleToggle}
      >
        {enabled
          ? running
            ? "Вкл · идёт"
            : elapsedMs > 0
              ? "Пауза"
              : "Вкл"
          : "Выкл"}
      </button>
    </div>
  );
}
