import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HomeButton } from "@/components/HomeButton";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { ResultsScreen } from "@/components/ResultsScreen";
import { SetupScreen } from "@/components/SetupScreen";
import { TimerDock } from "@/components/TimerDock";
import { TopicBackdrop } from "@/components/TopicBackdrop";
import { InterviewScreen } from "@/components/InterviewScreen";
import type { SessionResult } from "@/lib/types";

const sampleResult: SessionResult = {
  id: "1",
  date: "31.07.2026",
  topicId: "math",
  topicTitle: "Математика",
  difficulty: "medium",
  grade: 8,
  mode: "classic",
  durationMs: 65000,
  correctCount: 3,
  totalQuestions: 5,
  totalScore: 7,
  briefReview: "Хорошо, но есть пробелы.",
  recommendations: ["Дроби", "Уравнения"],
};

describe("HomeButton", () => {
  it("вызывает выход в меню", async () => {
    const onClick = vi.fn();
    render(<HomeButton onClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: /главное меню/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("LoadingIndicator", () => {
  it("показывает переданную подпись", () => {
    render(<LoadingIndicator label="Проверяю…" />);
    expect(screen.getByText("Проверяю…")).toBeInTheDocument();
  });
});

describe("TimerDock", () => {
  it("позволяет включать таймер только в режиме editable", async () => {
    const onToggle = vi.fn();
    const { rerender } = render(
      <TimerDock
        enabled={false}
        running={false}
        elapsedMs={0}
        editable
        onToggle={onToggle}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /Включить/i }));
    expect(onToggle).toHaveBeenCalledWith(true);

    rerender(
      <TimerDock
        enabled
        running
        elapsedMs={5000}
        editable={false}
        onToggle={onToggle}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /Включить|Выключить/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("00:05")).toBeInTheDocument();
    expect(screen.getByText("идёт")).toBeInTheDocument();
  });
});

describe("SetupScreen", () => {
  it("переключает режим и запускает тест", async () => {
    const onModeChange = vi.fn();
    const onSubmit = vi.fn();

    render(
      <SetupScreen
        topicId="informatics"
        difficulty="easy"
        grade={8}
        mode="classic"
        loading={false}
        error={null}
        onTopicChange={vi.fn()}
        onDifficultyChange={vi.fn()}
        onGradeChange={vi.fn()}
        onModeChange={onModeChange}
        onBack={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /Викторина/i }));
    expect(onModeChange).toHaveBeenCalledWith("quiz");

    await userEvent.click(screen.getByRole("button", { name: /Начать вопросы/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("показывает ошибку настройки", () => {
    render(
      <SetupScreen
        topicId="geography"
        difficulty="hard"
        grade={5}
        mode="quiz"
        loading={false}
        error="Нет сети"
        onTopicChange={vi.fn()}
        onDifficultyChange={vi.fn()}
        onGradeChange={vi.fn()}
        onModeChange={vi.fn()}
        onBack={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText("Нет сети")).toBeInTheDocument();
  });
});

describe("ResultsScreen", () => {
  it("показывает итоги и историю", async () => {
    const onRestart = vi.fn();
    render(
      <ResultsScreen
        result={sampleResult}
        history={[sampleResult]}
        onRestart={onRestart}
      />,
    );

    expect(screen.getByText(/Итоги тренировки/i)).toBeInTheDocument();
    expect(screen.getByText("3/5")).toBeInTheDocument();
    expect(screen.getByText(/Классический/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Пройти ещё раз/i }));
    expect(onRestart).toHaveBeenCalledTimes(1);
  });
});

describe("TopicBackdrop", () => {
  it("не рендерится без active", () => {
    const { container } = render(
      <TopicBackdrop topicId="biology" active={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it.each([
    "informatics",
    "math",
    "russian",
    "history",
    "biology",
    "english",
    "geography",
  ] as const)("рендерит фон темы %s", (topicId) => {
    const { container } = render(<TopicBackdrop topicId={topicId} active />);
    expect(container.querySelector(`.topic-${topicId}`)).toBeTruthy();
    expect(container.querySelector(".topic-motif")).toBeTruthy();
  });
});

describe("InterviewScreen classic", () => {
  it("блокирует отправку пустого ответа и принимает текст", async () => {
    const onAnswerChange = vi.fn();
    const onSubmit = vi.fn();

    render(
      <InterviewScreen
        topicTitle="Русский · 7 класс"
        difficulty="hard"
        mode="classic"
        questionNumber={2}
        question="Что такое причастие?"
        options={[]}
        selectedIndex={null}
        answer=""
        loading={false}
        error={null}
        lastFeedback="Разбор прошлого"
        onAnswerChange={onAnswerChange}
        onSelectOption={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByText("Классический")).toBeInTheDocument();
    expect(screen.getByText(/Разбор прошлого/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Отправить ответ/i })).toBeDisabled();

    await userEvent.type(screen.getByRole("textbox"), "Форма глагола");
    expect(onAnswerChange).toHaveBeenCalled();
  });

  it("стилизует кнопку отправки под сложность", () => {
    render(
      <InterviewScreen
        topicTitle="Биология · 9 класс"
        difficulty="medium"
        mode="classic"
        questionNumber={1}
        question="Что такое клетка?"
        options={[]}
        selectedIndex={null}
        answer="Единица жизни"
        loading={false}
        error="Ошибка API"
        lastFeedback={null}
        onAnswerChange={vi.fn()}
        onSelectOption={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: /Отправить ответ/i });
    expect(button.className).toContain("submit-btn--medium");
    expect(screen.getByRole("alert")).toHaveTextContent(/Ошибка API/i);
  });
});
