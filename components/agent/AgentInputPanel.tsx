"use client";

import { useId, useState } from "react";

import { VoiceInput } from "@/components/agent/VoiceInput";

export type AgentInputMode = "text" | "voice";

export type AgentInputPanelProps = {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  maxLength?: number;
  /** Без отдельной «карточки» — внутри единой панели workspace. */
  embedded?: boolean;
};

/** Переключение текст / голос и отправка реплики (задача 4.4). */
export function AgentInputPanel({
  onSubmit,
  disabled = false,
  maxLength = 4_000,
  embedded = false,
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
        <legend
          id={modeLegendId}
          className="text-sm font-medium text-apple-text"
        >
          Режим ввода
        </legend>
        <div
          className="mt-2 inline-flex rounded-full bg-apple-track p-1"
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
        <div
          className={
            embedded
              ? "space-y-3"
              : "rounded-[22px] bg-apple-surface p-5 shadow-[var(--apple-shadow-card)]"
          }
        >
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-apple-text"
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
            className="field-control mt-2 min-h-28 resize-y py-3 text-base leading-relaxed"
          />
          <button
            type="button"
            disabled={disabled || !draft.trim()}
            onClick={submitText}
            className="btn-primary mt-1"
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
      className={`min-h-11 rounded-full px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-apple-accent disabled:opacity-60 ${
        active
          ? "bg-apple-surface text-apple-text shadow-[var(--apple-shadow-card)]"
          : "text-apple-text-secondary hover:text-apple-text"
      }`}
    >
      {label}
    </button>
  );
}
