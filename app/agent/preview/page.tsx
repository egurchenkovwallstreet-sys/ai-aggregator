import type { Metadata } from "next";
import { Suspense } from "react";

import { PromptConfirmationDemo } from "@/components/agent/PromptConfirmationDemo";

export const metadata: Metadata = {
  title: "Подтверждение промпта",
  description: "Предпросмотр карточки подтверждения финального промпта.",
};

export default function AgentPreviewPage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-12 sm:py-16">
      <main
        id="main"
        tabIndex={-1}
        className="flex flex-1 flex-col outline-none"
      >
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Подтверждение промпта
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Карточка, которую агент покажет после сборки текста на русском.
          </p>
        </header>
        <div className="mt-8">
          <Suspense
            fallback={
              <p className="text-sm text-zinc-500" aria-live="polite">
                Загрузка карточки…
              </p>
            }
          >
            <PromptConfirmationDemo />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
