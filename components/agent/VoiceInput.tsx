"use client";

import { useId } from "react";

import { useVoiceInput } from "@/lib/voice/useVoiceInput";

export type VoiceInputProps = {
  onFinalTranscript: (text: string) => void;
  disabled?: boolean;
};

/** Голосовой ввод: запись + STT, interim через Web Speech (задачи 4.2–4.5). */
export function VoiceInput({
  onFinalTranscript,
  disabled = false,
}: VoiceInputProps) {
  const liveId = useId();
  const statusId = useId();
  const voice = useVoiceInput({ onFinalTranscript, disabled });

  const busy = disabled || voice.isProcessing;
  const toggleLabel = voice.isListening ? "Остановить запись" : "Начать запись";

  return (
    <section
      className="rounded-2xl border border-zinc-200 bg-white p-5"
      aria-labelledby={liveId}
      aria-busy={voice.isProcessing}
    >
      <h2 id={liveId} className="text-base font-semibold text-zinc-900">
        Голосовой ввод
      </h2>
      <p id={statusId} className="mt-1 text-sm text-zinc-600">
        {voice.isProcessing
          ? "Расшифровка…"
          : voice.isListening
            ? "Говорите. Текст ниже обновляется по мере распознавания."
            : "Нажмите кнопку и говорите по-русски."}
      </p>

      <InterimPreview text={voice.interimText} listening={voice.isListening} />

      {voice.error ? (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {voice.error}
        </p>
      ) : null}

      {voice.usedFallback ? (
        <p className="mt-2 text-xs text-amber-800" role="status">
          Использован запасной режим Web Speech (шлюз недоступен).
        </p>
      ) : null}

      <button
        type="button"
        disabled={busy}
        aria-pressed={voice.isListening}
        aria-describedby={statusId}
        onClick={() =>
          voice.isListening
            ? voice.stopListening()
            : void voice.startListening()
        }
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 sm:w-auto"
      >
        {toggleLabel}
      </button>
    </section>
  );
}

function InterimPreview({
  text,
  listening,
}: {
  text: string;
  listening: boolean;
}) {
  const show = listening || text.length > 0;
  if (!show) {
    return (
      <p className="mt-4 text-sm text-zinc-400" aria-live="polite">
        Промежуточный текст появится здесь.
      </p>
    );
  }

  return (
    <p
      className="mt-4 min-h-12 rounded-xl bg-zinc-50 px-4 py-3 text-base leading-relaxed text-zinc-900"
      aria-live="polite"
      aria-atomic="true"
    >
      {text || "…"}
    </p>
  );
}
