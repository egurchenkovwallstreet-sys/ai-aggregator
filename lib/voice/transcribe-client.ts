export type GatewaySttResponse = {
  text: string;
  language: string | null;
};

type SttError = { error: string };

/** STT через Next.js → voice-gateway (основной путь). */
export async function transcribeViaGateway(
  blob: Blob,
  filename = "recording.webm",
): Promise<GatewaySttResponse> {
  const form = new FormData();
  form.append("audio", blob, filename);

  const response = await fetch("/api/voice/stt", {
    method: "POST",
    body: form,
  });

  const data = (await response.json()) as GatewaySttResponse | SttError;
  if (!response.ok) {
    const message = "error" in data ? data.error : "Ошибка STT.";
    throw new Error(message);
  }

  return data as GatewaySttResponse;
}
