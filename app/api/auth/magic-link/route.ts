import { NextResponse } from "next/server";

import { sendMagicLinkEmail } from "@/server/auth/email/send-magic-link";
import { issueMagicLink } from "@/server/auth/magic-link.service";
import { magicLinkRequestSchema } from "@/server/auth/schemas";

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

  const parsed = magicLinkRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ошибка валидации." },
      { status: 400 },
    );
  }

  try {
    const linkUrl = await issueMagicLink(parsed.data.email, parsed.data.next);
    await sendMagicLinkEmail(parsed.data.email, linkUrl);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не удалось отправить ссылку.";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  return NextResponse.json({
    ok: true,
    message: "Если email зарегистрирован, мы отправили ссылку для входа.",
  });
}
