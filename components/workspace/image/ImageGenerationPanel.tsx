"use client";

import { useMemo, useState } from "react";

import { AgentInputPanel } from "@/components/agent/AgentInputPanel";
import { PromptConfirmation } from "@/components/agent/PromptConfirmation";
import { AgentChatLog } from "@/components/workspace/image/AgentChatLog";
import { GenerationPrice } from "@/components/workspace/image/GenerationPrice";
import { ImageResultStub } from "@/components/workspace/image/ImageResultStub";
import {
  creditsForModelPrice,
  getImageModelById,
  IMAGE_MODELS,
} from "@/lib/catalog/image-models";
import { useImageGenerationFlow } from "@/lib/workspace/useImageGenerationFlow";

/** Вкладка «Изображения»: модель, агент, цена, заглушка результата (7.2). */
export function ImageGenerationPanel() {
  const [modelId, setModelId] = useState(IMAGE_MODELS[3]?.id ?? "nano-lite");
  const model = useMemo(
    () => getImageModelById(modelId) ?? IMAGE_MODELS[0],
    [modelId],
  );
  const costCredits = creditsForModelPrice(model.priceRub);
  const flow = useImageGenerationFlow(model);

  return (
    <div className="space-y-6">
      <ModelPicker modelId={modelId} onChange={setModelId} />
      <GenerationPrice priceRub={model.priceRub} costCredits={costCredits} />

      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="text-base font-semibold text-zinc-900">AI-агент</h2>
        <div className="mt-4">
          <AgentChatLog messages={flow.messages} pending={flow.agentBusy} />
        </div>
        {flow.error ? (
          <p className="mt-3 text-sm text-red-700" role="alert">
            {flow.error}
          </p>
        ) : null}
        {!flow.proposedPrompt ? (
          <div className="mt-4">
            <AgentInputPanel
              disabled={flow.agentBusy || flow.confirmBusy}
              onSubmit={flow.sendUserMessage}
            />
          </div>
        ) : null}
      </section>

      {flow.proposedPrompt ? (
        <PromptConfirmation
          prompt={flow.proposedPrompt}
          busy={flow.confirmBusy}
          onConfirm={flow.confirmPrompt}
          onCancel={flow.cancelProposed}
        />
      ) : null}

      {flow.promptForApi ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-medium text-zinc-800">
            Промпт для модели
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-700">
            {flow.promptForApi}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={flow.runGenerateStub}
              className="inline-flex min-h-11 items-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Сгенерировать
            </button>
            <button
              type="button"
              onClick={flow.resetFlow}
              className="inline-flex min-h-11 items-center rounded-lg border border-zinc-300 px-4 text-sm font-medium text-zinc-800"
            >
              Новый диалог
            </button>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Кнопка показывает демо-результат. Реальный API — этап 5.1.
          </p>
        </section>
      ) : null}

      {flow.resultVisible && flow.promptForApi ? (
        <ImageResultStub
          modelLabel={model.label}
          promptSummary={flow.promptForApi}
        />
      ) : null}
    </div>
  );
}

type ModelPickerProps = {
  modelId: string;
  onChange: (id: string) => void;
};

function ModelPicker({ modelId, onChange }: ModelPickerProps) {
  const selectId = "image-model-select";
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <label htmlFor={selectId} className="text-sm font-medium text-zinc-800">
        Модель
      </label>
      <select
        id={selectId}
        value={modelId}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900"
      >
        {IMAGE_MODELS.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}
