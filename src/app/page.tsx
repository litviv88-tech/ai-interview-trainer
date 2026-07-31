"use client";

import { useState } from "react";
import { SetupScreen } from "@/components/SetupScreen";
import { StartScreen } from "@/components/StartScreen";
import type { AppStep, Difficulty, TopicId } from "@/lib/types";

export default function HomePage() {
  const [step, setStep] = useState<AppStep>("start");
  const [topicId, setTopicId] = useState<TopicId>("informatics");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  return (
    <main className="app-shell">
      <div className="mx-auto mb-5 w-full max-w-[920px] px-1 pt-2 text-white/90">
        <div className="brand text-lg sm:text-xl">AI-тренажёр собеседований</div>
        <div className="text-sm text-white/70">
          Выбор темы · уровни сложности · адаптивная вёрстка
        </div>
      </div>

      {step === "start" ? (
        <StartScreen onStart={() => setStep("setup")} />
      ) : (
        <SetupScreen
          topicId={topicId}
          difficulty={difficulty}
          loading={false}
          error={null}
          onTopicChange={setTopicId}
          onDifficultyChange={setDifficulty}
          onBack={() => setStep("start")}
          onSubmit={() => setStep("setup")}
        />
      )}
    </main>
  );
}
