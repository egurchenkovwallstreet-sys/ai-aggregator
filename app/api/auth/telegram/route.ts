import { NextResponse } from "next/server";

import { getTelegramBotToken } from "@/server/auth/config";
import { createSession } from "@/server/auth/session";
import { telegramLoginSchema } from "@/server/auth/telegram/schema";
import { verifyTelegramLogin } from "@/server/auth/telegram/verify";
import { findOrCreateUserByTelegramId } from "@/server/auth/users";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Некорректное тело запроса." },
      { status: 400 },
    );
  }

  const parsed = telegramLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Данные Telegram не прошли проверку." },
      { status: 400 },
    );
  }

  let botToken: string;
  try {
    botToken = getTelegramBotToken();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Telegram не настроен.";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const payload = parsed.data as Record<string, string | number> & {
    id: number;
    auth_date: number;
    hash: string;
  };

  if (!verifyTelegramLogin(payload, botToken)) {
    return NextResponse.json(
      { error: "Подпись Telegram недействительна." },
      { status: 401 },
    );
  }

  const user = await findOrCreateUserByTelegramId(payload.id);
  await createSession(user.id, {
    email: user.email,
    telegramId: user.telegramId,
  });

  return NextResponse.json({ ok: true });
}
