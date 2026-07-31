import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StartScreen } from "@/components/StartScreen";
import { DifficultyPicker } from "@/components/DifficultyPicker";
import { InterviewScreen } from "@/components/InterviewScreen";
import { ThemeToggle } from "@/components/ThemeToggle";

describe("StartScreen", () => {
  it("показывает название проекта и кнопку старта", async () => {
    const onStart = vi.fn();
    render(<StartScreen onStart={onStart} />);

    expect(
      screen.getByRole("heading", {
        name: /Тренажёр для школьника/i,
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

describe("ThemeToggle", () => {
  it("переключает светлую и тёмную тему", async () => {
    render(<ThemeToggle />);

    const button = await screen.findByRole("button", {
      name: /Включить тёмную тему|Включить светлую тему/i,
    });

    const before = document.documentElement.dataset.theme;
    await userEvent.click(button);
    const after = document.documentElement.dataset.theme;

    expect(after).not.toBe(before);
    expect(["light", "dark"]).toContain(after);
  });
});

describe("InterviewScreen quiz", () => {
  it("показывает 4 варианта и передаёт выбор", async () => {
    const onSelectOption = vi.fn();
    const onSubmit = vi.fn();

    render(
      <InterviewScreen
        topicTitle="Информатика · 8 класс"
        difficulty="easy"
        mode="quiz"
        questionNumber={1}
        question="Сколько бит в байте?"
        options={["4", "8", "16", "32"]}
        selectedIndex={null}
        answer=""
        loading={false}
        error={null}
        lastFeedback={null}
        onAnswerChange={vi.fn()}
        onSelectOption={onSelectOption}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByText("Викторина")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /B\s*8/i }));
    expect(onSelectOption).toHaveBeenCalledWith(1);
  });
});
