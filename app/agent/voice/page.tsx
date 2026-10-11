import type { Metadata } from "next";
import { Suspense } from "react";

import { AgentInputDemo } from "@/components/agent/AgentInputDemo";

export const metadata: Metadata = {
  title: "Голосовой ввод",
  description: "Демо VoiceInput и переключения текст / голос.",
};

export default function AgentVoicePage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-12 sm:py-16">
      <main
        id="main"
        tabIndex={-1}
        className="flex flex-1 flex-col outline-none"
      >
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Голос и текст
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Этап 4: запись, interim Web Speech, STT через шлюз, fallback.
          </p>
        </header>
        <div className="mt-8">
          <Suspense
            fallback={
              <p className="text-sm text-zinc-500" aria-live="polite">
                Загрузка…
              </p>
            }
          >
            <AgentInputDemo />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
