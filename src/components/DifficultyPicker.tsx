"use client";

import type { Difficulty } from "@/lib/types";
import { DIFFICULTIES } from "@/lib/constants";

const CLASS_BY_DIFFICULTY: Record<Difficulty, string> = {
  easy: "difficulty-easy",
  medium: "difficulty-medium",
  hard: "difficulty-hard",
};

type DifficultyPickerProps = {
  value: Difficulty;
  onChange: (value: Difficulty) => void;
};

export function DifficultyPicker({ value, onChange }: DifficultyPickerProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {DIFFICULTIES.map((item) => {
        const active = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={active}
            className={`rounded-2xl border px-4 py-4 text-left transition ${CLASS_BY_DIFFICULTY[item.id]} ${
              active ? "is-active scale-[1.02]" : ""
            }`}
            onClick={() => onChange(item.id)}
          >
            <div className="text-base font-bold">{item.label}</div>
            <div className="mt-1 text-sm opacity-90">{item.hint}</div>
          </button>
        );
      })}
    </div>
  );
}
