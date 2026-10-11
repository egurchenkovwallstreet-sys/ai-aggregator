export type DialogUserMessage = {
  role: "user" | "assistant";
  content: string;
};

/** Собирает raw_input из реплик пользователя в диалоге агента. */
export function buildRawInputFromMessages(
  messages: DialogUserMessage[],
): string {
  return messages
    .filter((message) => message.role === "user")
    .map((message) => message.content.trim())
    .filter((text) => text.length > 0)
    .join("\n\n");
}
