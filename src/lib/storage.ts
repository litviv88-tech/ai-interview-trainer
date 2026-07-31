import { HISTORY_LIMIT, STORAGE_KEY } from "./constants";
import type { Grade, SessionResult } from "./types";

function normalizeResult(item: Partial<SessionResult> & { id?: string }): SessionResult | null {
  if (!item?.id || !item.topicId || !item.topicTitle) {
    return null;
  }

  return {
    id: item.id,
    date: item.date ?? "",
    topicId: item.topicId,
    topicTitle: item.topicTitle,
    difficulty: item.difficulty ?? "easy",
    grade: (item.grade as Grade | undefined) ?? 8,
    durationMs: item.durationMs ?? null,
    correctCount: item.correctCount ?? 0,
    totalQuestions: item.totalQuestions ?? 5,
    totalScore: item.totalScore ?? 1,
    briefReview: item.briefReview ?? "",
    recommendations: Array.isArray(item.recommendations)
      ? item.recommendations
      : [],
  };
}

export function loadHistory(): SessionResult[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as Array<Partial<SessionResult>>;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((item) => normalizeResult(item))
      .filter((item): item is SessionResult => item != null)
      .slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
}

export function saveResult(result: SessionResult): SessionResult[] {
  const next = [result, ...loadHistory()].slice(0, HISTORY_LIMIT);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
