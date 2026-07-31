"use client";

import { useEffect, useRef, useState } from "react";
import { InterviewScreen } from "@/components/InterviewScreen";
import { ResultsScreen } from "@/components/ResultsScreen";
import { SetupScreen } from "@/components/SetupScreen";
import { StartScreen } from "@/components/StartScreen";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TimerDock } from "@/components/TimerDock";
import { TopicBackdrop } from "@/components/TopicBackdrop";
import {
  TIMER_STORAGE_KEY,
  TOTAL_QUESTIONS,
  TOPICS,
} from "@/lib/constants";
import { assertOnline, mapApiError, validateAnswer } from "@/lib/errors";
import { loadHistory, saveResult } from "@/lib/storage";
import type {
  AppStep,
  Difficulty,
  FinalSummary,
  GeneratedQuestion,
  Grade,
  InterviewMode,
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
  const [grade, setGrade] = useState<Grade>(8);
  const [mode, setMode] = useState<InterviewMode>("classic");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answer, setAnswer] = useState("");
  const [rounds, setRounds] = useState<QuestionRound[]>([]);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [history, setHistory] = useState<SessionResult[]>([]);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef(0);

  useEffect(() => {
    setHistory(loadHistory());

    try {
      const saved = window.localStorage.getItem(TIMER_STORAGE_KEY);
      if (saved === "off") setTimerEnabled(false);
      if (saved === "on") setTimerEnabled(true);
    } catch {
      // ignore
    }

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

  useEffect(() => {
    if (!timerEnabled || !timerRunning || startedAtRef.current == null) {
      return;
    }

    const tick = () => {
      if (startedAtRef.current != null) {
        setElapsedMs(accumulatedMsRef.current + (Date.now() - startedAtRef.current));
      }
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [timerEnabled, timerRunning]);

  const topicBackdropActive = step === "setup" || step === "interview" || step === "results";

  useEffect(() => {
    document.body.dataset.topicBg = topicBackdropActive ? "on" : "off";
    return () => {
      delete document.body.dataset.topicBg;
    };
  }, [topicBackdropActive]);

  const topicTitle =
    TOPICS.find((topic) => topic.id === topicId)?.title ?? "Тема";

  function resetTimer() {
    accumulatedMsRef.current = 0;
    startedAtRef.current = null;
    setElapsedMs(0);
    setTimerRunning(false);
  }

  function startTimer() {
    if (!timerEnabled) {
      resetTimer();
      return;
    }
    accumulatedMsRef.current = 0;
    startedAtRef.current = Date.now();
    setElapsedMs(0);
    setTimerRunning(true);
  }

  function pauseTimer() {
    if (!timerEnabled || !timerRunning || startedAtRef.current == null) {
      setTimerRunning(false);
      return;
    }
    accumulatedMsRef.current += Date.now() - startedAtRef.current;
    startedAtRef.current = null;
    setElapsedMs(accumulatedMsRef.current);
    setTimerRunning(false);
  }

  function resumeTimer() {
    if (!timerEnabled || step !== "interview") {
      return;
    }
    startedAtRef.current = Date.now();
    setTimerRunning(true);
  }

  function stopTimer(): number | null {
    if (!timerEnabled) {
      setTimerRunning(false);
      return null;
    }
    if (timerRunning && startedAtRef.current != null) {
      accumulatedMsRef.current += Date.now() - startedAtRef.current;
    }
    startedAtRef.current = null;
    setElapsedMs(accumulatedMsRef.current);
    setTimerRunning(false);
    return accumulatedMsRef.current;
  }

  function applyGeneratedQuestion(data: GeneratedQuestion) {
    setCurrentQuestion(data.question);
    if (mode === "quiz") {
      setOptions(data.options ?? []);
      setCorrectIndex(
        typeof data.correctIndex === "number" ? data.correctIndex : null,
      );
      setSelectedIndex(null);
      setAnswer("");
    } else {
      setOptions([]);
      setCorrectIndex(null);
      setSelectedIndex(null);
      setAnswer("");
    }
  }

  async function startInterview() {
    setLoading(true);
    setError(null);

    try {
      const data = await postJson<GeneratedQuestion>("/api/interview/question", {
        topicId,
        difficulty,
        grade,
        mode,
        questionNumber: 1,
        previousRounds: [],
      });

      setRounds([]);
      setQuestionNumber(1);
      applyGeneratedQuestion(data);
      setLastFeedback(null);
      setResult(null);
      setStep("interview");
      startTimer();
    } catch (err) {
      setError(mapApiError(err));
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    setLoading(true);
    setError(null);
    pauseTimer();

    try {
      let displayAnswer: string;
      let evaluated: { evaluation: QuestionRound["evaluation"] };

      if (mode === "quiz") {
        if (
          selectedIndex == null ||
          correctIndex == null ||
          options.length !== 4
        ) {
          throw new Error("Выберите один из четырёх вариантов ответа.");
        }

        displayAnswer = options[selectedIndex] ?? `Вариант ${selectedIndex + 1}`;
        evaluated = await postJson<{
          evaluation: QuestionRound["evaluation"];
        }>("/api/interview/evaluate", {
          mode: "quiz",
          question: currentQuestion,
          options,
          correctIndex,
          selectedIndex,
        });
      } else {
        const trimmed = validateAnswer(answer);
        displayAnswer = trimmed;
        evaluated = await postJson<{
          evaluation: QuestionRound["evaluation"];
        }>("/api/interview/evaluate", {
          mode: "classic",
          topicId,
          difficulty,
          grade,
          question: currentQuestion,
          answer: trimmed,
        });
      }

      const nextRound: QuestionRound = {
        questionNumber,
        question: currentQuestion,
        answer: displayAnswer,
        evaluation: evaluated.evaluation,
      };
      const nextRounds = [...rounds, nextRound];
      setRounds(nextRounds);
      setLastFeedback(evaluated.evaluation.feedback);

      if (questionNumber >= TOTAL_QUESTIONS) {
        const durationMs = stopTimer();
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
          grade,
          mode,
          durationMs,
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
        setSelectedIndex(null);
        return;
      }

      const nextNumber = questionNumber + 1;
      const nextQuestion = await postJson<GeneratedQuestion>(
        "/api/interview/question",
        {
          topicId,
          difficulty,
          grade,
          mode,
          questionNumber: nextNumber,
          previousRounds: nextRounds,
        },
      );

      setQuestionNumber(nextNumber);
      applyGeneratedQuestion(nextQuestion);
      resumeTimer();
    } catch (err) {
      setError(mapApiError(err));
      resumeTimer();
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setStep("start");
    setTopicId("informatics");
    setDifficulty("easy");
    setGrade(8);
    setMode("classic");
    setQuestionNumber(1);
    setCurrentQuestion("");
    setOptions([]);
    setCorrectIndex(null);
    setSelectedIndex(null);
    setAnswer("");
    setRounds([]);
    setLastFeedback(null);
    setError(null);
    setResult(null);
    resetTimer();
  }

  function handleTimerToggle(enabled: boolean) {
    setTimerEnabled(enabled);
    if (!enabled) {
      resetTimer();
      return;
    }
    if (step === "interview" && !loading) {
      accumulatedMsRef.current = 0;
      startedAtRef.current = Date.now();
      setElapsedMs(0);
      setTimerRunning(true);
    }
  }

  return (
    <main className="app-shell">
      <TopicBackdrop topicId={topicId} active={topicBackdropActive} />
      <div className="app-header">
        <div>
          <div className="brand text-lg sm:text-xl">Тренажёр для школьника</div>
          <div className="subtitle text-sm">
            Строгая проверка · 5 вопросов · классы 5–11
          </div>
        </div>
        <ThemeToggle />
      </div>

      {step === "start" ? (
        <StartScreen onStart={() => setStep("setup")} />
      ) : null}

      {step === "setup" ? (
        <SetupScreen
          topicId={topicId}
          difficulty={difficulty}
          grade={grade}
          mode={mode}
          loading={loading}
          error={error}
          onTopicChange={setTopicId}
          onDifficultyChange={setDifficulty}
          onGradeChange={setGrade}
          onModeChange={setMode}
          onBack={() => {
            setError(null);
            setStep("start");
          }}
          onSubmit={startInterview}
        />
      ) : null}

      {step === "interview" ? (
        <InterviewScreen
          topicTitle={`${topicTitle} · ${grade} класс`}
          difficulty={difficulty}
          mode={mode}
          questionNumber={questionNumber}
          question={currentQuestion}
          options={options}
          selectedIndex={selectedIndex}
          answer={answer}
          loading={loading}
          error={error}
          lastFeedback={lastFeedback}
          onAnswerChange={setAnswer}
          onSelectOption={setSelectedIndex}
          onSubmit={submitAnswer}
        />
      ) : null}

      {step === "results" && result ? (
        <ResultsScreen result={result} history={history} onRestart={restart} />
      ) : null}

      <TimerDock
        enabled={timerEnabled}
        running={timerRunning}
        elapsedMs={elapsedMs}
        onToggle={handleTimerToggle}
      />
    </main>
  );
}
