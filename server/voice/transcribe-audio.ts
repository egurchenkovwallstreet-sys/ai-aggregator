import "server-only";

import { getVoiceConfig } from "./config";

const MAX_AUDIO_BYTES = 8 * 1024 * 1024;

type SttResponse = {
  text?: string;
  language?: string;
  detail?: string;
};

/** Проксирует аудио в локальный voice-gateway STT. */
export async function transcribeAudio(
  bytes: Buffer,
  filename: string,
  mimeType: string,
): Promise<{ text: string; language: string | null }> {
  if (bytes.length === 0) {
    throw new Error("Пустой аудиофайл.");
  }
  if (bytes.length > MAX_AUDIO_BYTES) {
    throw new Error("Файл слишком большой (макс. 8 МБ).");
  }

  const { sttUrl } = getVoiceConfig();
  const payload = Uint8Array.from(bytes);
  const blob = new Blob([payload], {
    type: mimeType || "application/octet-stream",
  });
  const form = new FormData();
  form.append("audio", blob, filename || "recording.webm");

  const response = await fetch(sttUrl, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(120_000),
  });

  const data = (await response.json()) as SttResponse;
  if (!response.ok) {
    const message = data.detail ?? "STT-шлюз вернул ошибку.";
    throw new Error(message);
  }

  const text = data.text?.trim();
  if (!text) {
    throw new Error("Пустая расшифровка.");
  }

  return { text, language: data.language ?? null };
}
