import { NextResponse } from "next/server";
import { finalizeSession } from "@/lib/openai";
import type { Difficulty, QuestionRound, TopicId } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      topicId?: TopicId;
      difficulty?: Difficulty;
      rounds?: QuestionRound[];
    };

    if (!body.topicId || !body.difficulty || !body.rounds?.length) {
      return NextResponse.json(
        { error: "Не хватает данных для итогового разбора." },
        { status: 400 },
      );
    }

    const summary = await finalizeSession({
      topicId: body.topicId,
      difficulty: body.difficulty,
      rounds: body.rounds,
    });

    return NextResponse.json({ summary });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Ошибка API при формировании итогов.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
