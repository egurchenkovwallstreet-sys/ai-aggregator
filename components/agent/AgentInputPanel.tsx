"use client";

import { useId, useState } from "react";

import { VoiceInput } from "@/components/agent/VoiceInput";

export type AgentInputMode = "text" | "voice";

export type AgentInputPanelProps = {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  maxLength?: number;
};

/** Переключение текст / голос и отправка реплики (задача 4.4). */
export function AgentInputPanel({
  onSubmit,
  disabled = false,
  maxLength = 4_000,
}: AgentInputPanelProps) {
  const [mode, setMode] = useState<AgentInputMode>("text");
  const [draft, setDraft] = useState("");
  const textareaId = useId();
  const modeLegendId = useId();

  function submitText() {
    const text = draft.trim();
    if (!text || disabled) return;
    onSubmit(text);
    setDraft("");
  }

  return (
    <div className="space-y-4">
      <fieldset>
        <legend id={modeLegendId} className="text-sm font-medium text-zinc-800">
          Режим ввода
        </legend>
        <div
          className="mt-2 inline-flex rounded-lg border border-zinc-200 p-1"
          role="radiogroup"
          aria-labelledby={modeLegendId}
        >
          <ModeButton
            label="Текст"
            active={mode === "text"}
            onClick={() => setMode("text")}
            disabled={disabled}
          />
          <ModeButton
            label="Голос"
            active={mode === "voice"}
            onClick={() => setMode("voice")}
            disabled={disabled}
          />
        </div>
      </fieldset>

      {mode === "text" ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-zinc-800"
          >
            Сообщение агенту
          </label>
          <textarea
            id={textareaId}
            value={draft}
            maxLength={maxLength}
            rows={4}
            disabled={disabled}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                event.preventDefault();
                submitText();
              }
            }}
            className="mt-2 min-h-28 w-full resize-y rounded-xl border border-zinc-300 px-3 py-2 text-base text-zinc-900"
          />
          <button
            type="button"
            disabled={disabled || !draft.trim()}
            onClick={submitText}
            className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white disabled:opacity-60"
          >
            Отправить
          </button>
        </div>
      ) : (
        <VoiceInput
          disabled={disabled}
          onFinalTranscript={(text) => onSubmit(text)}
        />
      )}
    </div>
  );
}

type ModeButtonProps = {
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
};

function ModeButton({ label, active, disabled, onClick }: ModeButtonProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      disabled={disabled}
      onClick={onClick}
      className={`min-h-11 rounded-md px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:opacity-60 ${
        active ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-50"
      }`}
    >
      {label}
    </button>
  );
}
