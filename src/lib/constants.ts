import type { DifficultyOption, Topic } from "./types";

export const TOTAL_QUESTIONS = 5;
export const MAX_ANSWER_LENGTH = 2000;
export const HISTORY_LIMIT = 5;
export const STORAGE_KEY = "ai-interview-trainer-history-v1";

export const TOPICS: Topic[] = [
  {
    id: "informatics",
    title: "Информатика",
    description: "Алгоритмы, данные, логика и основы программирования",
  },
  {
    id: "math",
    title: "Математика",
    description: "Алгебра, геометрия и текстовые задачи",
  },
  {
    id: "russian",
    title: "Русский язык",
    description: "Орфография, пунктуация и речевые нормы",
  },
  {
    id: "history",
    title: "История",
    description: "Ключевые события, даты и причинно-следственные связи",
  },
  {
    id: "biology",
    title: "Биология",
    description: "Клетка, организмы, экосистемы и термины",
  },
  {
    id: "english",
    title: "Английский язык",
    description: "Грамматика, лексика и короткие объяснения",
  },
];

export const DIFFICULTIES: DifficultyOption[] = [
  {
    id: "easy",
    label: "Лёгкий",
    hint: "Базовые вопросы школьной программы",
  },
  {
    id: "medium",
    label: "Средний",
    hint: "Нужно объяснить ход мысли",
  },
  {
    id: "hard",
    label: "Сложный",
    hint: "Ловушки, исключения и точные формулировки",
  },
];
