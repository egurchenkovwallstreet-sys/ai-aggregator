"use client";

import { useState } from "react";

import { PromptConfirmation } from "@/components/agent/PromptConfirmation";

const SAMPLE_PROMPT =
  "Рыжий кот крупным планом, фотореализм, тёплый золотой свет заката, спокойный взгляд в камеру, размытый осенний двор на фоне.";

/** Демонстрация PromptConfirmation до экрана генерации (этап 7). */
export function PromptConfirmationDemo() {
  const [status, setStatus] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-600" role="status">
          {status}
        </p>
        <button
          type="button"
          onClick={() => {
            setVisible(true);
            setStatus(null);
          }}
          className="inline-flex min-h-11 items-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white"
        >
          Показать карточку снова
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PromptConfirmation
        prompt={SAMPLE_PROMPT}
        onConfirm={(prompt) => {
          setStatus(`Подтверждено. Дальше — перевод (задача 3.6). ${prompt}`);
        }}
        onCancel={() => {
          setVisible(false);
          setStatus("Отменено. Промпт не уйдёт в перевод.");
        }}
      />
      {status ? (
        <p className="text-sm leading-relaxed text-zinc-600" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
