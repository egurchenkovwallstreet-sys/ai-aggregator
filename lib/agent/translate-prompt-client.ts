export type AgentContentType = "image" | "video" | "audio" | "text";

export type TranslatePromptPayload = {
  contentType: AgentContentType;
  rawInput: string;
  finalPromptRu: string;
  targetModel?: string;
};

export type TranslatePromptResponse = {
  promptId: string;
  finalPromptRu: string;
  translatedPrompt: string;
  adaptedPrompt: string | null;
  modelProfile: "nano-banana" | "veo" | "midjourney" | null;
  promptForModel: string;
  targetModel: string | null;
  contentType: AgentContentType;
};

type TranslatePromptError = {
  error: string;
};

/** Вызов POST /api/agent/translate после подтверждения PromptConfirmation. */
export async function translateConfirmedPrompt(
  payload: TranslatePromptPayload,
): Promise<TranslatePromptResponse> {
  const response = await fetch("/api/agent/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as
    TranslatePromptResponse | TranslatePromptError;

  if (!response.ok) {
    const message =
      "error" in data ? data.error : "Не удалось перевести промпт.";
    throw new Error(message);
  }

  return data as TranslatePromptResponse;
}
