import OpenAI from "openai";
import type {
  AnswerEvaluation,
  Difficulty,
  FinalSummary,
  QuestionRound,
  TopicId,
} from "./types";
import { TOPICS } from "./constants";

const STRICT_SYSTEM = `Ты — строгий школьный экзаменатор на собеседовании.
Правила:
1) Никогда не соглашайся с неверным ответом и не смягчай оценку ради вежливости.
2) Если ответ частично верный — прямо укажи, что именно неверно.
3) Не ставь высокий балл за уверенный, но ошибочный текст.
4) Пиши по-русски, ясно и конкретно.
5) Не используй фразы вроде «хорошая попытка», если ответ неправильный.
6) Возвращай только валидный JSON без markdown.`;

function getClient() {
  const apiKey =
    process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Не задан OPENAI_API_KEY (или OPENROUTER_API_KEY). Добавьте ключ в переменные окружения.",
    );
  }

  return new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });
}

function topicTitle(topicId: TopicId) {
  return TOPICS.find((item) => item.id === topicId)?.title ?? topicId;
}

function difficultyLabel(difficulty: Difficulty) {
  if (difficulty === "easy") return "лёгкий";
  if (difficulty === "medium") return "средний";
  return "сложный";
}

async function askJson<T>(prompt: string): Promise<T> {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.35,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: STRICT_SYSTEM },
      { role: "user", content: prompt },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI вернул пустой ответ. Попробуйте ещё раз.");
  }

  return JSON.parse(content) as T;
}

export async function generateQuestion(params: {
  topicId: TopicId;
  difficulty: Difficulty;
  questionNumber: number;
  previousRounds: QuestionRound[];
}): Promise<string> {
  const history = params.previousRounds
    .map(
      (round) =>
        `Q${round.questionNumber}: ${round.question}\nA: ${round.answer}\nОценка: ${round.evaluation.isCorrect ? "верно" : "неверно"}; ${round.evaluation.feedback}`,
    )
    .join("\n\n");

  const data = await askJson<{ question: string }>(`Сгенерируй вопрос №${params.questionNumber} для школьного собеседования.
Тема: ${topicTitle(params.topicId)}
Сложность: ${difficultyLabel(params.difficulty)}
Предыдущие ответы:
${history || "пока нет"}

Требования к вопросу:
- один конкретный вопрос без вариантов ответа;
- учитывай слабые места из предыдущих ответов;
- не повторяй уже заданные вопросы;
- уровень сложности строго соответствует выбранному.

JSON: {"question":"..."}`);

  if (!data.question?.trim()) {
    throw new Error("Не удалось сгенерировать вопрос.");
  }

  return data.question.trim();
}

export async function evaluateAnswer(params: {
  topicId: TopicId;
  difficulty: Difficulty;
  question: string;
  answer: string;
}): Promise<AnswerEvaluation> {
  const data = await askJson<AnswerEvaluation>(`Оцени ответ школьника строго.
Тема: ${topicTitle(params.topicId)}
Сложность: ${difficultyLabel(params.difficulty)}
Вопрос: ${params.question}
Ответ ученика: ${params.answer}

Критерии:
- isCorrect = true только если ответ по сути верный и без критических ошибок;
- score от 0 до 2 (целое): 0 — неверно, 1 — частично, 2 — полностью верно;
- feedback: коротко и жёстко, без похвалы за ошибки;
- mistakes: что именно неправильно (или "нет критических ошибок");
- whatToReview: что повторить.

JSON:
{
  "isCorrect": boolean,
  "score": number,
  "feedback": string,
  "mistakes": string,
  "whatToReview": string
}`);

  return {
    isCorrect: Boolean(data.isCorrect),
    score: Math.max(0, Math.min(2, Number(data.score) || 0)),
    feedback: data.feedback?.trim() || "Оценка не получена.",
    mistakes: data.mistakes?.trim() || "Не указано.",
    whatToReview: data.whatToReview?.trim() || "Повторите тему целиком.",
  };
}

export async function finalizeSession(params: {
  topicId: TopicId;
  difficulty: Difficulty;
  rounds: QuestionRound[];
}): Promise<FinalSummary> {
  const transcript = params.rounds
    .map(
      (round) =>
        `Вопрос ${round.questionNumber}: ${round.question}
Ответ: ${round.answer}
Верно: ${round.evaluation.isCorrect}
Балл за вопрос: ${round.evaluation.score}/2
Ошибки: ${round.evaluation.mistakes}
Разбор: ${round.evaluation.feedback}`,
    )
    .join("\n\n");

  const correctCount = params.rounds.filter((round) => round.evaluation.isCorrect).length;
  const rawScore = params.rounds.reduce((sum, round) => sum + round.evaluation.score, 0);
  const totalScore = Math.max(1, Math.min(10, Math.round((rawScore / 10) * 10) || 1));

  const data = await askJson<{
    briefReview: string;
    recommendations: string[];
    nextFocus: string;
  }>(`Собери итоговый разбор тренировки.
Тема: ${topicTitle(params.topicId)}
Сложность: ${difficultyLabel(params.difficulty)}
Правильных ответов: ${correctCount}/5
Суммарный балл по вопросам: ${rawScore}/10

Транскрипт:
${transcript}

Сформулируй:
- briefReview: 2–4 предложения, строго и по делу;
- recommendations: массив из 3–5 конкретных пунктов «что повторить»;
- nextFocus: одна главная тема для следующей тренировки.

Не завышай впечатление, если ответы слабые.

JSON:
{
  "briefReview": string,
  "recommendations": string[],
  "nextFocus": string
}`);

  return {
    correctCount,
    totalScore,
    briefReview: data.briefReview?.trim() || "Разбор недоступен.",
    recommendations:
      Array.isArray(data.recommendations) && data.recommendations.length > 0
        ? data.recommendations.slice(0, 5)
        : ["Повторите базовые определения выбранной темы."],
    nextFocus: data.nextFocus?.trim() || topicTitle(params.topicId),
  };
}
