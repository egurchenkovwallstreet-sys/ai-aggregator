"use client";

import { useState } from "react";

import { PromptConfirmation } from "@/components/agent/PromptConfirmation";
import {
  DEMO_MODEL_OPTIONS,
  type DemoModelOption,
} from "@/lib/agent/demo-model-options";
import { translateConfirmedPrompt } from "@/lib/agent/translate-prompt-client";

const SAMPLE_RAW =
  "Хочу картинку рыжего кота крупным планом.\n\nФотореализм, закат, спокойное настроение.";

const SAMPLE_PROMPT =
  "Рыжий кот крупным планом, фотореализм, тёплый золотой свет заката, спокойный взгляд в камеру, размытый осенний двор на фоне.";

const SAMPLE_VIDEO_RAW =
  "Нужен короткий ролик: кот во дворе на закате, камера плавно облетает.";

const SAMPLE_VIDEO_PROMPT =
  "Камера медленно облетает осенний двор; рыжий кот поднимает голову и смотрит в объектив, золотой закат, лёгкий ветер в листве.";

/** Демонстрация PromptConfirmation до экрана генерации (этап 7). */
export function PromptConfirmationDemo() {
  const [modelOption, setModelOption] = useState<DemoModelOption>(
    DEMO_MODEL_OPTIONS[0],
  );
  const [status, setStatus] = useState<string | null>(null);
  const [translated, setTranslated] = useState<string | null>(null);
  const [adapted, setAdapted] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const samplePrompt =
    modelOption.contentType === "video" ? SAMPLE_VIDEO_PROMPT : SAMPLE_PROMPT;
  const sampleRaw =
    modelOption.contentType === "video" ? SAMPLE_VIDEO_RAW : SAMPLE_RAW;

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
            setTranslated(null);
            setAdapted(null);
            setError(null);
          }}
          className="inline-flex min-h-11 items-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white"
        >
          Показать карточку снова
        </button>
      </div>
    );
  }

  async function handleConfirm(prompt: string) {
    setBusy(true);
    setError(null);
    setTranslated(null);
    setAdapted(null);
    setStatus("Переводим и адаптируем промпт…");

    try {
      const result = await translateConfirmedPrompt({
        contentType: modelOption.contentType,
        rawInput: sampleRaw,
        finalPromptRu: prompt,
        targetModel: modelOption.targetModel,
      });
      setTranslated(result.translatedPrompt);
      setAdapted(result.adaptedPrompt);
      setStatus(
        result.adaptedPrompt
          ? `Готово (${result.modelProfile ?? "модель"}). Сохранено в БД: ${result.promptId.slice(0, 8)}…`
          : `Перевод готов (id ${result.promptId.slice(0, 8)}…); профиль модели не распознан — базовый EN.`,
      );
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Ошибка обработки промпта.";
      setError(message);
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  const selectId = "demo-target-model";

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={selectId} className="text-sm font-medium text-zinc-800">
          Модель для адаптации
        </label>
        <select
          id={selectId}
          value={modelOption.id}
          disabled={busy}
          onChange={(event) => {
            const next = DEMO_MODEL_OPTIONS.find(
              (item) => item.id === event.target.value,
            );
            if (next) setModelOption(next);
          }}
          className="mt-2 min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900"
        >
          {DEMO_MODEL_OPTIONS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <PromptConfirmation
        key={`${modelOption.id}-${samplePrompt.slice(0, 24)}`}
        prompt={samplePrompt}
        busy={busy}
        onConfirm={handleConfirm}
        onCancel={() => {
          setVisible(false);
          setStatus("Отменено. Промпт не уйдёт в перевод.");
          setTranslated(null);
          setAdapted(null);
          setError(null);
        }}
      />
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {status ? (
        <p className="text-sm leading-relaxed text-zinc-600" role="status">
          {status}
        </p>
      ) : null}
      {adapted ? (
        <section
          className="rounded-2xl border border-zinc-900/10 bg-zinc-900 p-4 text-white"
          aria-label="Адаптированный промпт"
        >
          <h3 className="text-sm font-medium">
            Промпт для API ({modelOption.label})
          </h3>
          <p className="mt-2 text-sm leading-relaxed">{adapted}</p>
        </section>
      ) : null}
      {translated ? (
        <section
          className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
          aria-label="Базовый перевод"
        >
          <h3 className="text-sm font-medium text-zinc-800">
            Базовый перевод (EN)
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-900">
            {translated}
          </p>
        </section>
      ) : null}
    </div>
  );
}
