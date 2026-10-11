import type { DialogMessage } from "@/lib/agent/dialog-client";

type AgentChatLogProps = {
  messages: DialogMessage[];
  pending?: boolean;
};

/** Лента диалога с агентом на вкладке изображений. */
export function AgentChatLog({ messages, pending }: AgentChatLogProps) {
  if (messages.length === 0 && !pending) {
    return (
      <p className="text-sm text-zinc-500">
        Опишите картинку текстом или голосом — агент задаст уточнения на
        русском.
      </p>
    );
  }

  return (
    <ul className="max-h-64 space-y-3 overflow-y-auto pr-1" aria-live="polite">
      {messages.map((message, index) => (
        <li
          key={`${index}-${message.role}`}
          className={
            message.role === "user"
              ? "ml-4 rounded-xl bg-zinc-900 px-3 py-2 text-sm text-white"
              : "mr-4 rounded-xl bg-zinc-100 px-3 py-2 text-sm text-zinc-900"
          }
        >
          {message.content}
        </li>
      ))}
      {pending ? (
        <li className="mr-4 text-sm text-zinc-500">Агент думает…</li>
      ) : null}
    </ul>
  );
}
