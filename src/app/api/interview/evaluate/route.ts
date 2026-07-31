import { NextResponse } from "next/server";
import { evaluateAnswer, evaluateQuizAnswer } from "@/lib/openai";
import { MAX_ANSWER_LENGTH } from "@/lib/constants";
import type { Difficulty, Grade, InterviewMode, TopicId } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      topicId?: TopicId;
      difficulty?: Difficulty;
      grade?: Grade;
      mode?: InterviewMode;
      question?: string;
      answer?: string;
      options?: string[];
      correctIndex?: number;
      selectedIndex?: number;
    };

    const mode = body.mode ?? "classic";

    if (mode === "quiz") {
      if (
        !body.question ||
        !Array.isArray(body.options) ||
        body.options.length !== 4 ||
        body.correctIndex == null ||
        body.selectedIndex == null
      ) {
        return NextResponse.json(
          { error: "Не хватает параметров для проверки викторины." },
          { status: 400 },
        );
      }

      if (
        !Number.isInteger(body.selectedIndex) ||
        body.selectedIndex < 0 ||
        body.selectedIndex > 3
      ) {
        return NextResponse.json(
          { error: "Выберите один из четырёх вариантов ответа." },
          { status: 400 },
        );
      }

      const evaluation = evaluateQuizAnswer({
        options: body.options,
        correctIndex: body.correctIndex,
        selectedIndex: body.selectedIndex,
      });

      return NextResponse.json({ evaluation });
    }

    if (
      !body.topicId ||
      !body.difficulty ||
      !body.grade ||
      !body.question ||
      body.answer == null
    ) {
      return NextResponse.json(
        { error: "Не хватает параметров для оценки ответа." },
        { status: 400 },
      );
    }

    const answer = body.answer.trim();
    if (!answer) {
      return NextResponse.json(
        { error: "Ответ не может быть пустым." },
        { status: 400 },
      );
    }

    if (answer.length > MAX_ANSWER_LENGTH) {
      return NextResponse.json(
        {
          error: `Слишком длинный текст. Максимум ${MAX_ANSWER_LENGTH} символов.`,
        },
        { status: 400 },
      );
    }

    const evaluation = await evaluateAnswer({
      topicId: body.topicId,
      difficulty: body.difficulty,
      grade: body.grade,
      question: body.question,
      answer,
    });

    return NextResponse.json({ evaluation });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка API при оценке ответа.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
