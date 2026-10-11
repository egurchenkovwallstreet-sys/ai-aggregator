import { NextResponse } from "next/server";

import { getCurrentUser } from "@/server/auth/get-current-user";
import { transcribeAudio } from "@/server/voice/transcribe-audio";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Требуется сессия. Обновите страницу или войдите." },
      { status: 401 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Ожидается multipart/form-data." },
      { status: 400 },
    );
  }

  const file = form.get("audio");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Поле audio обязательно." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await transcribeAudio(
      buffer,
      file.name,
      file.type || "audio/webm",
    );
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Не удалось расшифровать аудио.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
