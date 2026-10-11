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

/** Вкладка «Изображения»: единая панель + агент (7.2). */
export function ImageGenerationPanel() {
  const [modelId, setModelId] = useState(IMAGE_MODELS[3]?.id ?? "nano-lite");
  const model = useMemo(
    () => getImageModelById(modelId) ?? IMAGE_MODELS[0],
    [modelId],
  );
  const costCredits = creditsForModelPrice(model.priceRub);
  const flow = useImageGenerationFlow(model);
  const selectId = "image-model-select";

  return (
    <div className="space-y-6">
      <article className="apple-panel overflow-hidden">
        <div className="grid gap-6 border-b apple-divider p-6 sm:grid-cols-[1fr_minmax(12rem,16rem)] sm:items-end sm:gap-8 sm:p-8">
          <div>
            <label
              htmlFor={selectId}
              className="text-sm font-medium text-apple-text"
            >
              Модель
            </label>
            <select
              id={selectId}
              value={modelId}
              onChange={(event) => setModelId(event.target.value)}
              className="field-control mt-2"
            >
              {IMAGE_MODELS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <GenerationPrice
            priceRub={model.priceRub}
            costCredits={costCredits}
          />
        </div>

        <section className="p-6 sm:p-8" aria-labelledby="image-agent-heading">
          <h2
            id="image-agent-heading"
            className="text-lg font-semibold tracking-[-0.02em] text-apple-text"
          >
            AI-агент
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-apple-text-secondary">
            Текст или голос — уточним детали на русском, затем покажем промпт.
          </p>
          <div className="mt-5">
            <AgentChatLog messages={flow.messages} pending={flow.agentBusy} />
          </div>
          {flow.error ? (
            <p className="mt-3 text-sm text-[#ff3b30]" role="alert">
              {flow.error}
            </p>
          ) : null}
          {!flow.proposedPrompt ? (
            <div className="mt-5 border-t apple-divider pt-5">
              <AgentInputPanel
                disabled={flow.agentBusy || flow.confirmBusy}
                onSubmit={flow.sendUserMessage}
                embedded
              />
            </div>
          ) : null}
        </section>

        {flow.proposedPrompt ? (
          <div className="border-t apple-divider px-6 pb-6 sm:px-8 sm:pb-8">
            <PromptConfirmation
              prompt={flow.proposedPrompt}
              busy={flow.confirmBusy}
              onConfirm={flow.confirmPrompt}
              onCancel={flow.cancelProposed}
            />
          </div>
        ) : null}

        {flow.promptForApi ? (
          <div className="border-t apple-divider p-6 sm:p-8">
            <h2 className="text-sm font-medium text-apple-text">
              Промпт для модели
            </h2>
            <p className="mt-2 text-sm leading-[1.85] text-apple-text-body">
              {flow.promptForApi}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={flow.runGenerateStub}
                className="btn-primary"
              >
                Сгенерировать
              </button>
              <button
                type="button"
                onClick={flow.resetFlow}
                className="btn-secondary"
              >
                Новый диалог
              </button>
            </div>
            <p className="mt-3 text-xs text-apple-text-tertiary">
              Демо-результат. Реальный API — этап 5.1.
            </p>
          </div>
        ) : null}
      </article>

      {flow.resultVisible && flow.promptForApi ? (
        <ImageResultStub
          modelLabel={model.label}
          promptSummary={flow.promptForApi}
        />
      ) : null}
    </div>
  );
}
