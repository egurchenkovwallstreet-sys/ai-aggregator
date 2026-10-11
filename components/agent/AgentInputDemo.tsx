"use client";

import { useState } from "react";

import { AgentInputPanel } from "@/components/agent/AgentInputPanel";

/** Демо ввода агента (текст / голос) до экрана чата этапа 7. */
export function AgentInputDemo() {
  const [messages, setMessages] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      <AgentInputPanel
        onSubmit={(text) => setMessages((prev) => [...prev, text])}
      />
      {messages.length > 0 ? (
        <ol
          className="space-y-2 text-sm text-zinc-800"
          aria-label="Отправленные реплики"
        >
          {messages.map((message, index) => (
            <li
              key={`${index}-${message.slice(0, 16)}`}
              className="rounded-lg bg-zinc-50 px-3 py-2"
            >
              {message}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
