import { HISTORY_LIMIT, STORAGE_KEY } from "./constants";
import type { SessionResult } from "./types";

export function loadHistory(): SessionResult[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as SessionResult[];
    return Array.isArray(parsed) ? parsed.slice(0, HISTORY_LIMIT) : [];
  } catch {
    return [];
  }
}

export function saveResult(result: SessionResult): SessionResult[] {
  const next = [result, ...loadHistory()].slice(0, HISTORY_LIMIT);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
