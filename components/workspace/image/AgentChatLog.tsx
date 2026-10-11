import type { DialogMessage } from "@/lib/agent/dialog-client";

type AgentChatLogProps = {
  messages: DialogMessage[];
  pending?: boolean;
};

/** Лента диалога с агентом. */
export function AgentChatLog({ messages, pending }: AgentChatLogProps) {
  if (messages.length === 0 && !pending) {
    return null;
  }

  return (
    <ul className="max-h-72 space-y-3 overflow-y-auto pr-1" aria-live="polite">
      {messages.map((message, index) => (
        <li
          key={`${index}-${message.role}`}
          className={
            message.role === "user"
              ? "ml-6 max-w-[92%] rounded-2xl bg-apple-text px-4 py-2.5 text-sm leading-relaxed text-white sm:ml-auto"
              : "mr-6 max-w-[92%] rounded-2xl bg-apple-bg px-4 py-2.5 text-sm leading-relaxed text-apple-text-body"
          }
        >
          {message.content}
        </li>
      ))}
      {pending ? (
        <li className="text-sm text-apple-text-tertiary">Агент думает…</li>
      ) : null}
    </ul>
  );
}
