"use client";

type HomeButtonProps = {
  onClick: () => void;
};

export function HomeButton({ onClick }: HomeButtonProps) {
  return (
    <button
      type="button"
      className="home-btn"
      onClick={onClick}
      aria-label="Выйти в главное меню"
      title="Главное меню"
    >
      <span aria-hidden="true">←</span>
      <span>Меню</span>
    </button>
  );
}
