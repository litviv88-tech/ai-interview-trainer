"use client";

import { useEffect, useState } from "react";
import { InterviewScreen } from "@/components/InterviewScreen";
import { ResultsScreen } from "@/components/ResultsScreen";
import { SetupScreen } from "@/components/SetupScreen";
import { StartScreen } from "@/components/StartScreen";
import { TOTAL_QUESTIONS, TOPICS } from "@/lib/constants";
import { assertOnline, mapApiError, validateAnswer } from "@/lib/errors";
import { loadHistory, saveResult } from "@/lib/storage";
import type {
  AppStep,
  Difficulty,
  FinalSummary,
  QuestionRound,
  SessionResult,
  TopicId,
} from "@/lib/types";

async function postJson<T>(url: string, payload: unknown): Promise<T> {
  assertOnline();

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || "Ошибка API. Попробуйте позже.");
  }
  return data;
}

export default function HomePage() {
  const [step, setStep] = useState<AppStep>("start");
  const [topicId, setTopicId] = useState<TopicId>("informatics");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [rounds, setRounds] = useState<QuestionRound[]>([]);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [history, setHistory] = useState<SessionResult[]>([]);

  useEffect(() => {
    setHistory(loadHistory());

    function handleOffline() {
      setError("Нет интернет-соединения. Проверьте сеть и попробуйте снова.");
    }

    function handleOnline() {
      setError((current) =>
        current?.includes("интернет") ? null : current,
      );
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const topicTitle =
    TOPICS.find((topic) => topic.id === topicId)?.title ?? "Тема";

  async function startInterview() {
    setLoading(true);
    setError(null);

    try {
      const data = await postJson<{ question: string }>("/api/interview/question", {
        topicId,
        difficulty,
        questionNumber: 1,
        previousRounds: [],
      });

      setRounds([]);
      setQuestionNumber(1);
      setCurrentQuestion(data.question);
      setAnswer("");
      setLastFeedback(null);
      setResult(null);
      setStep("interview");
    } catch (err) {
      setError(mapApiError(err));
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    setLoading(true);
    setError(null);

    try {
      const trimmed = validateAnswer(answer);

      const evaluated = await postJson<{
        evaluation: QuestionRound["evaluation"];
      }>("/api/interview/evaluate", {
        topicId,
        difficulty,
        question: currentQuestion,
        answer: trimmed,
      });

      const nextRound: QuestionRound = {
        questionNumber,
        question: currentQuestion,
        answer: trimmed,
        evaluation: evaluated.evaluation,
      };
      const nextRounds = [...rounds, nextRound];
      setRounds(nextRounds);
      setLastFeedback(evaluated.evaluation.feedback);

      if (questionNumber >= TOTAL_QUESTIONS) {
        const finalized = await postJson<{ summary: FinalSummary }>(
          "/api/interview/finalize",
          {
            topicId,
            difficulty,
            rounds: nextRounds,
          },
        );

        const session: SessionResult = {
          id: crypto.randomUUID(),
          date: new Date().toLocaleString("ru-RU"),
          topicId,
          topicTitle,
          difficulty,
          correctCount: finalized.summary.correctCount,
          totalQuestions: TOTAL_QUESTIONS,
          totalScore: finalized.summary.totalScore,
          briefReview: finalized.summary.briefReview,
          recommendations: finalized.summary.recommendations,
        };

        const nextHistory = saveResult(session);
        setHistory(nextHistory);
        setResult(session);
        setStep("results");
        setAnswer("");
        return;
      }

      const nextNumber = questionNumber + 1;
      const nextQuestion = await postJson<{ question: string }>(
        "/api/interview/question",
        {
          topicId,
          difficulty,
          questionNumber: nextNumber,
          previousRounds: nextRounds,
        },
      );

      setQuestionNumber(nextNumber);
      setCurrentQuestion(nextQuestion.question);
      setAnswer("");
    } catch (err) {
      setError(mapApiError(err));
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setStep("start");
    setTopicId("informatics");
    setDifficulty("easy");
    setQuestionNumber(1);
    setCurrentQuestion("");
    setAnswer("");
    setRounds([]);
    setLastFeedback(null);
    setError(null);
    setResult(null);
  }

  return (
    <main className="app-shell">
      <div className="mx-auto mb-5 w-full max-w-[920px] px-1 pt-2 text-white/90">
        <div className="brand text-lg sm:text-xl">AI-тренажёр собеседований</div>
        <div className="text-sm text-white/70">
          Строгая проверка · 5 вопросов · история в браузере
        </div>
      </div>

      {step === "start" ? (
        <StartScreen onStart={() => setStep("setup")} />
      ) : null}

      {step === "setup" ? (
        <SetupScreen
          topicId={topicId}
          difficulty={difficulty}
          loading={loading}
          error={error}
          onTopicChange={setTopicId}
          onDifficultyChange={setDifficulty}
          onBack={() => {
            setError(null);
            setStep("start");
          }}
          onSubmit={startInterview}
        />
      ) : null}

      {step === "interview" ? (
        <InterviewScreen
          topicTitle={topicTitle}
          difficulty={difficulty}
          questionNumber={questionNumber}
          question={currentQuestion}
          answer={answer}
          loading={loading}
          error={error}
          lastFeedback={lastFeedback}
          onAnswerChange={setAnswer}
          onSubmit={submitAnswer}
        />
      ) : null}

      {step === "results" && result ? (
        <ResultsScreen result={result} history={history} onRestart={restart} />
      ) : null}
    </main>
  );
}
