"use client";

type LoadingIndicatorProps = {
  label?: string;
};

export function LoadingIndicator({
  label = "Думаю над ответом…",
}: LoadingIndicatorProps) {
  return (
    <div className="inline-flex items-center gap-3 text-sm font-semibold text-[var(--accent-strong)]">
      <span className="loader !border-[rgba(31,138,112,0.25)] !border-t-[var(--accent)]" />
      <span className="pulse-soft">{label}</span>
    </div>
  );
}
