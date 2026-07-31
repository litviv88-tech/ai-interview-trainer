"use client";

type LoadingIndicatorProps = {
  label?: string;
};

export function LoadingIndicator({
  label = "Думаю над ответом…",
}: LoadingIndicatorProps) {
  return (
    <div className="inline-flex items-center gap-3 text-sm font-semibold text-[var(--accent-strong)]">
      <span className="loader" />
      <span className="pulse-soft">{label}</span>
    </div>
  );
}
