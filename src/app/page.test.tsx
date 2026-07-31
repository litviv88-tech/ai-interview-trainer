import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomePage from "@/app/page";

describe("HomePage flow", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const body = init?.body ? JSON.parse(String(init.body)) : {};

        if (url.includes("/api/interview/question")) {
          if (body.mode === "quiz") {
            return Response.json({
              question: `Вопрос викторины ${body.questionNumber}`,
              options: ["A", "B", "C", "D"],
              correctIndex: 1,
            });
          }
          return Response.json({
            question: `Вопрос ${body.questionNumber}`,
          });
        }

        if (url.includes("/api/interview/evaluate")) {
          return Response.json({
            evaluation: {
              isCorrect: true,
              score: 2,
              feedback: "Верно",
              mistakes: "нет",
              whatToReview: "дальше",
            },
          });
        }

        if (url.includes("/api/interview/finalize")) {
          return Response.json({
            summary: {
              correctCount: 5,
              totalScore: 10,
              briefReview: "Отлично",
              recommendations: ["Закрепить"],
              nextFocus: "Следующая тема",
            },
          });
        }

        return Response.json({ error: "unknown" }, { status: 404 });
      }),
    );
  });

  it("проходит путь: старт → настройка → первый вопрос", async () => {
    render(<HomePage />);

    await userEvent.click(
      screen.getByRole("button", { name: /Начать тренировку/i }),
    );
    expect(screen.getByText(/Режим, тема и класс/i)).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /Начать вопросы/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /^Вопрос 1$/i }),
      ).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /главное меню/i })).toBeInTheDocument();

    await userEvent.type(screen.getByRole("textbox"), "Правильный ответ");
    await userEvent.click(screen.getByRole("button", { name: /Отправить ответ/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /^Вопрос 2$/i }),
      ).toBeInTheDocument();
    });
  });

  it("запускает режим викторины", async () => {
    render(<HomePage />);

    await userEvent.click(
      screen.getByRole("button", { name: /Начать тренировку/i }),
    );
    await userEvent.click(screen.getByRole("button", { name: /Викторина/i }));
    await userEvent.click(
      screen.getByRole("button", { name: /Начать вопросы/i }),
    );

    await waitFor(() => {
      expect(screen.getByText("Викторина")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: /B\s*B/i }));
    await userEvent.click(screen.getByRole("button", { name: /Отправить ответ/i }));

    await waitFor(() => {
      expect(screen.getByText(/Вопрос 2 из 5/i)).toBeInTheDocument();
    });
  });

  it("позволяет выйти в меню кнопкой Home", async () => {
    render(<HomePage />);

    await userEvent.click(
      screen.getByRole("button", { name: /Начать тренировку/i }),
    );
    await userEvent.click(screen.getByRole("button", { name: /главное меню/i }));

    expect(
      screen.getByRole("button", { name: /Начать тренировку/i }),
    ).toBeInTheDocument();
  });

  it("включает и выключает таймер только в главном меню", async () => {
    render(<HomePage />);

    const toggle = screen.getByRole("button", { name: /^Выключить$/ });
    await userEvent.click(toggle);
    expect(screen.getByRole("button", { name: /^Включить$/ })).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /Начать тренировку/i }),
    );

    expect(
      screen.queryByRole("button", { name: /^Включить$|^Выключить$/ }),
    ).not.toBeInTheDocument();
  });
});
