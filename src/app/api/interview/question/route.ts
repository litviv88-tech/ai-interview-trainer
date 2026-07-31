import { NextResponse } from "next/server";
import { generateQuestion } from "@/lib/openai";
import type { Difficulty, Grade, QuestionRound, TopicId } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      topicId?: TopicId;
      difficulty?: Difficulty;
      grade?: Grade;
      questionNumber?: number;
      previousRounds?: QuestionRound[];
    };

    if (
      !body.topicId ||
      !body.difficulty ||
      !body.questionNumber ||
      !body.grade
    ) {
      return NextResponse.json(
        { error: "Не хватает параметров для генерации вопроса." },
        { status: 400 },
      );
    }

    const question = await generateQuestion({
      topicId: body.topicId,
      difficulty: body.difficulty,
      grade: body.grade,
      questionNumber: body.questionNumber,
      previousRounds: body.previousRounds ?? [],
    });

    return NextResponse.json({ question });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Ошибка API при генерации вопроса.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
