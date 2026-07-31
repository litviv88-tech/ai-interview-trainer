import type {
  AnswerEvaluation,
  Difficulty,
  FinalSummary,
  GeneratedQuestion,
  Grade,
  InterviewMode,
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

const MODEL =
  process.env.OPENAI_MODEL?.trim() ||
  process.env.OPENROUTER_MODEL?.trim() ||
  "deepseek/deepseek-chat";

function getConfig() {
  const apiKey = (
    process.env.OPENROUTER_API_KEY ||
    process.env.OPENAI_API_KEY ||
    ""
  ).trim();
  const baseUrl = (
    process.env.OPENAI_BASE_URL ||
    "https://openrouter.ai/api/v1"
  ).replace(/\/$/, "");

  if (
    !apiKey ||
    apiKey === "your_api_key_here" ||
    apiKey === "sk-your-key-here"
  ) {
    throw new Error(
      "Не задан OPENROUTER_API_KEY в Vercel. Добавьте ключ OpenRouter в Environment Variables проекта.",
    );
  }

  return { apiKey, baseUrl };
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
  const { apiKey, baseUrl } = getConfig();

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://trenazhor-dlya-shkolnika.vercel.app",
      "X-Title": "School Interview Trainer",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: STRICT_SYSTEM },
        { role: "user", content: prompt },
      ],
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    let details = raw;
    try {
      const parsed = JSON.parse(raw) as {
        error?: { message?: string } | string;
      };
      if (typeof parsed.error === "string") details = parsed.error;
      else if (parsed.error && typeof parsed.error === "object" && parsed.error.message) {
        details = parsed.error.message;
      }
    } catch {
      // keep raw
    }
    throw new Error(`Ошибка AI API (${response.status}): ${details}`);
  }

  const data = JSON.parse(raw) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("AI вернул пустой ответ. Попробуйте ещё раз.");
  }

  const cleaned = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "");

  return JSON.parse(cleaned) as T;
}

export async function generateQuestion(params: {
  topicId: TopicId;
  difficulty: Difficulty;
  grade: Grade;
  mode: InterviewMode;
  questionNumber: number;
  previousRounds: QuestionRound[];
}): Promise<GeneratedQuestion> {
  const history = params.previousRounds
    .map(
      (round) =>
        `Q${round.questionNumber}: ${round.question}\nA: ${round.answer}\nОценка: ${round.evaluation.isCorrect ? "верно" : "неверно"}; ${round.evaluation.feedback}`,
    )
    .join("\n\n");

  if (params.mode === "quiz") {
    const data = await askJson<{
      question: string;
      options: string[];
      correctIndex: number;
    }>(`Сгенерируй вопрос викторины №${params.questionNumber}.
Тема: ${topicTitle(params.topicId)}
Класс: ${params.grade}
Сложность: ${difficultyLabel(params.difficulty)}
Предыдущие ответы:
${history || "пока нет"}

Требования:
- один конкретный вопрос;
- ровно 4 варианта ответа;
- только один правильный;
- материал строго для ${params.grade} класса;
- не повторяй уже заданные вопросы;
- правильный вариант не всегда первый;
- incorrectIndex не нужен, укажи correctIndex от 0 до 3.

JSON:
{
  "question":"...",
  "options":["...","...","...","..."],
  "correctIndex": 0
}`);

    const options = Array.isArray(data.options)
      ? data.options.map((item) => String(item).trim()).filter(Boolean)
      : [];
    const correctIndex = Number(data.correctIndex);

    if (!data.question?.trim() || options.length !== 4) {
      throw new Error("Не удалось сгенерировать вопрос викторины.");
    }
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
      throw new Error("Некорректный правильный вариант в вопросе викторины.");
    }

    return {
      question: data.question.trim(),
      options,
      correctIndex,
    };
  }

  const data = await askJson<{ question: string }>(`Сгенерируй вопрос №${params.questionNumber} для школьного собеседования.
Тема: ${topicTitle(params.topicId)}
Класс: ${params.grade}
Сложность: ${difficultyLabel(params.difficulty)}
Предыдущие ответы:
${history || "пока нет"}

Требования к вопросу:
- один конкретный вопрос без вариантов ответа;
- материал строго для ${params.grade} класса;
- учитывай слабые места из предыдущих ответов;
- не повторяй уже заданные вопросы;
- уровень сложности строго соответствует выбранному.

JSON: {"question":"..."}`);

  if (!data.question?.trim()) {
    throw new Error("Не удалось сгенерировать вопрос.");
  }

  return { question: data.question.trim() };
}

export function evaluateQuizAnswer(params: {
  options: string[];
  correctIndex: number;
  selectedIndex: number;
}): AnswerEvaluation {
  const { options, correctIndex, selectedIndex } = params;
  const isCorrect = selectedIndex === correctIndex;
  const correctText = options[correctIndex] ?? "не указан";

  return {
    isCorrect,
    score: isCorrect ? 2 : 0,
    feedback: isCorrect
      ? "Верно. Выбран правильный вариант."
      : `Неверно. Правильный ответ: «${correctText}».`,
    mistakes: isCorrect
      ? "нет критических ошибок"
      : `Выбран вариант «${options[selectedIndex] ?? "—"}» вместо «${correctText}».`,
    whatToReview: isCorrect
      ? "Можно переходить к следующей теме."
      : "Повторите материал этого вопроса и близкие определения.",
  };
}

export async function evaluateAnswer(params: {
  topicId: TopicId;
  difficulty: Difficulty;
  grade: Grade;
  question: string;
  answer: string;
}): Promise<AnswerEvaluation> {
  const data = await askJson<AnswerEvaluation>(`Оцени ответ школьника строго.
Тема: ${topicTitle(params.topicId)}
Класс: ${params.grade}
Сложность: ${difficultyLabel(params.difficulty)}
Вопрос: ${params.question}
Ответ ученика: ${params.answer}

Оценивай по программе ${params.grade} класса.

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

  const correctCount = params.rounds.filter((round) => round.evaluation.isCorrect)
    .length;
  const rawScore = params.rounds.reduce(
    (sum, round) => sum + round.evaluation.score,
    0,
  );

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
    totalScore: Math.max(1, Math.min(10, Math.round((rawScore / 10) * 10) || 1)),
    briefReview: data.briefReview?.trim() || "Разбор недоступен.",
    recommendations:
      Array.isArray(data.recommendations) && data.recommendations.length > 0
        ? data.recommendations.slice(0, 5)
        : ["Повторите базовые определения выбранной темы."],
    nextFocus: data.nextFocus?.trim() || topicTitle(params.topicId),
  };
}
