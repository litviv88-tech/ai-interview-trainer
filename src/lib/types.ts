export type Difficulty = "easy" | "medium" | "hard";

export type Grade = 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type TopicId =
  | "informatics"
  | "math"
  | "russian"
  | "history"
  | "biology"
  | "english";

export type AppStep = "start" | "setup" | "interview" | "results";

export interface Topic {
  id: TopicId;
  title: string;
  description: string;
}

export interface DifficultyOption {
  id: Difficulty;
  label: string;
  hint: string;
}

export interface AnswerEvaluation {
  isCorrect: boolean;
  score: number;
  feedback: string;
  mistakes: string;
  whatToReview: string;
}

export interface QuestionRound {
  questionNumber: number;
  question: string;
  answer: string;
  evaluation: AnswerEvaluation;
}

export interface FinalSummary {
  correctCount: number;
  totalScore: number;
  briefReview: string;
  recommendations: string[];
  nextFocus: string;
}

export interface SessionResult {
  id: string;
  date: string;
  topicId: TopicId;
  topicTitle: string;
  difficulty: Difficulty;
  grade: Grade;
  durationMs: number | null;
  correctCount: number;
  totalQuestions: number;
  totalScore: number;
  briefReview: string;
  recommendations: string[];
}

export interface InterviewState {
  topicId: TopicId;
  difficulty: Difficulty;
  grade: Grade;
  questionNumber: number;
  currentQuestion: string;
  rounds: QuestionRound[];
}
