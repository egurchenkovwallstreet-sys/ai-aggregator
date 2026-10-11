import { NextResponse } from "next/server";

import { runAgentDialog } from "@/server/agent/dialog.service";
import { agentDialogRequestSchema } from "@/server/agent/dialog.schema";
import { getCurrentUser } from "@/server/auth/get-current-user";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Требуется сессия. Обновите страницу или войдите." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Некорректное тело запроса." },
      { status: 400 },
    );
  }

  const parsed = agentDialogRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ошибка валидации." },
      { status: 400 },
    );
  }

  try {
    const result = await runAgentDialog(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Не удалось получить ответ агента.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
