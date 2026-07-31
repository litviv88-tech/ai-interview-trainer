export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "ai-interview-trainer-theme-v1";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function getPreferredTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isTheme(saved)) {
      return saved;
    }
  } catch {
    // ignore storage errors
  }

  return typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore storage errors
  }
}
