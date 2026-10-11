import "server-only";

import type { ChatMessage } from "./chat-types";
import { getProvodConfig } from "./provod.config";

type OpenAIChatResponse = {
  choices?: Array<{
    message?: { content?: string | null };
  }>;
  error?: { message?: string };
};

/** Запрос chat/completions к provod.ai (OpenAI-compatible). */
export async function createChatCompletion(
  messages: ChatMessage[],
): Promise<string> {
  const { apiKey, baseUrl, model } = getProvodConfig();

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
    }),
  });

  const data = (await response.json()) as OpenAIChatResponse;

  if (!response.ok) {
    const message = data.error?.message ?? "Ошибка LLM-шлюза.";
    throw new Error(message);
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Пустой ответ от модели.");
  }

  return content;
}
