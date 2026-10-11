export type DialogMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AgentDialogResponse = {
  reply: string;
  phase: "clarifying" | "ready" | "proposed";
  proposedPrompt: string | null;
  clarification: {
    filled: string[];
    missing: string[];
    nextQuestions: string[];
  };
};

type DialogError = { error: string };

export async function postAgentDialog(body: {
  contentType: "image" | "video" | "audio" | "text";
  messages: DialogMessage[];
  targetModel?: string;
}): Promise<AgentDialogResponse> {
  const response = await fetch("/api/agent/dialog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as AgentDialogResponse | DialogError;
  if (!response.ok) {
    const message = "error" in data ? data.error : "Ошибка агента.";
    throw new Error(message);
  }

  return data as AgentDialogResponse;
}
