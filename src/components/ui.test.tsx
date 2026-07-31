import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StartScreen } from "@/components/StartScreen";
import { DifficultyPicker } from "@/components/DifficultyPicker";

describe("StartScreen", () => {
  it("показывает название проекта и кнопку старта", async () => {
    const onStart = vi.fn();
    render(<StartScreen onStart={onStart} />);

    expect(
      screen.getByRole("heading", {
        name: /AI-тренажёр собеседований для школьника/i,
      }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /Начать тренировку/i }),
    );
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});

describe("DifficultyPicker", () => {
  it("подсвечивает выбранный уровень", async () => {
    const onChange = vi.fn();
    render(<DifficultyPicker value="easy" onChange={onChange} />);

    const easy = screen.getByRole("button", { name: /Лёгкий/i });
    const hard = screen.getByRole("button", { name: /Сложный/i });

    expect(easy).toHaveAttribute("aria-pressed", "true");
    expect(hard).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(hard);
    expect(onChange).toHaveBeenCalledWith("hard");
  });
});
