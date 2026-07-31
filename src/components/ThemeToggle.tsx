"use client";

import { useEffect, useState } from "react";
import {
  applyTheme,
  getPreferredTheme,
  type Theme,
} from "@/lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initial = getPreferredTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={
        theme === "light" ? "Включить тёмную тему" : "Включить светлую тему"
      }
      title={theme === "light" ? "Тёмная тема" : "Светлая тема"}
    >
      <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
      <span>{theme === "light" ? "Тёмная" : "Светлая"}</span>
    </button>
  );
}
