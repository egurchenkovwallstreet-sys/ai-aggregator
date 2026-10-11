"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";

const MAX_PROMPT_LENGTH = 4_000;

function useEscapeAction(
  busy: boolean,
  editing: boolean,
  setEditing: (value: boolean) => void,
  setEmptyError: (value: boolean) => void,
  onCancel: () => void,
) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape" || busy) return;
      if (editing) {
        setEditing(false);
        setEmptyError(false);
        return;
      }
      onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, editing, onCancel, setEditing, setEmptyError]);
}

export type PromptConfirmationProps = {
  prompt: string;
  onConfirm: (prompt: string) => void;
  onCancel: () => void;
  busy?: boolean;
};

function usePromptDraft(
  prompt: string,
  onConfirm: (prompt: string) => void,
  onCancel: () => void,
  busy: boolean,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(prompt);
  const [emptyError, setEmptyError] = useState(false);
  const [syncedPrompt, setSyncedPrompt] = useState(prompt);

  if (prompt !== syncedPrompt) {
    setSyncedPrompt(prompt);
    setDraft(prompt);
    setEditing(false);
    setEmptyError(false);
  }

  useEffect(() => {
    if (editing) textareaRef.current?.focus();
  }, [editing]);

  useEscapeAction(busy, editing, setEditing, setEmptyError, onCancel);

  function confirm() {
    const text = draft.trim();
    if (!text) {
      setEmptyError(true);
      setEditing(true);
      return;
    }
    onConfirm(text);
  }

  return {
    textareaRef,
    editing,
    draft,
    emptyError,
    setDraft,
    setEditing,
    setEmptyError,
    confirm,
  };
}

/** Карточка подтверждения финального промпта (SPEC §2, задача 3.5). */
export function PromptConfirmation({
  prompt,
  onConfirm,
  onCancel,
  busy = false,
}: PromptConfirmationProps) {
  const titleId = useId();
  const hintId = useId();
  const fieldId = useId();
  const errorId = useId();
  const draftState = usePromptDraft(prompt, onConfirm, onCancel, busy);

  return (
    <section
      role="region"
      aria-labelledby={titleId}
      aria-describedby={hintId}
      aria-busy={busy}
      className="pt-2"
    >
      <h2
        id={titleId}
        className="text-lg font-semibold tracking-[-0.02em] text-apple-text"
      >
        Финальный промпт
      </h2>
      <p
        id={hintId}
        className="mt-1 text-sm leading-[1.85] text-apple-text-secondary"
      >
        Проверьте текст на русском. Перевод под модель начнётся только после
        подтверждения.
      </p>

      <PromptBody
        editing={draftState.editing}
        draft={draftState.draft}
        fieldId={fieldId}
        errorId={errorId}
        emptyError={draftState.emptyError}
        busy={busy}
        textareaRef={draftState.textareaRef}
        onDraftChange={(value) => {
          draftState.setDraft(value);
          if (value.trim()) draftState.setEmptyError(false);
        }}
        onConfirm={draftState.confirm}
      />

      <PromptActions
        editing={draftState.editing}
        busy={busy}
        onConfirm={draftState.confirm}
        onToggleEdit={() => draftState.setEditing((value) => !value)}
        onCancel={onCancel}
      />
    </section>
  );
}

type PromptBodyProps = {
  editing: boolean;
  draft: string;
  fieldId: string;
  errorId: string;
  emptyError: boolean;
  busy: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onDraftChange: (value: string) => void;
  onConfirm: () => void;
};

function PromptBody({
  editing,
  draft,
  fieldId,
  errorId,
  emptyError,
  busy,
  textareaRef,
  onDraftChange,
  onConfirm,
}: PromptBodyProps) {
  if (!editing) {
    return (
      <blockquote className="mt-5 rounded-[18px] bg-apple-bg px-4 py-3 text-base leading-[1.85] text-apple-text-body">
        {draft}
      </blockquote>
    );
  }

  return (
    <div className="mt-5">
      <label htmlFor={fieldId} className="text-sm font-medium text-apple-text">
        Текст промпта
      </label>
      <textarea
        ref={textareaRef}
        id={fieldId}
        value={draft}
        maxLength={MAX_PROMPT_LENGTH}
        rows={5}
        disabled={busy}
        aria-invalid={emptyError}
        aria-describedby={emptyError ? errorId : undefined}
        onChange={(event) => onDraftChange(event.target.value)}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            event.preventDefault();
            onConfirm();
          }
        }}
        className="field-control mt-2 min-h-32 resize-y py-3 text-base leading-relaxed"
      />
      <p className="mt-1 text-xs tabular-nums text-apple-text-tertiary">
        {draft.length} / {MAX_PROMPT_LENGTH}
      </p>
      {emptyError ? (
        <p id={errorId} className="mt-2 text-sm text-red-700" role="alert">
          Введите текст промпта.
        </p>
      ) : null}
    </div>
  );
}

type PromptActionsProps = {
  editing: boolean;
  busy: boolean;
  onConfirm: () => void;
  onToggleEdit: () => void;
  onCancel: () => void;
};

function PromptActions({
  editing,
  busy,
  onConfirm,
  onToggleEdit,
  onCancel,
}: PromptActionsProps) {
  return (
    <div
      className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
      role="group"
      aria-label="Действия с промптом"
    >
      <button
        type="button"
        onClick={onConfirm}
        disabled={busy}
        className="btn-primary"
      >
        {busy ? "Подтверждаем…" : "Подтвердить"}
      </button>
      <button
        type="button"
        onClick={onToggleEdit}
        disabled={busy}
        aria-pressed={editing}
        className="btn-secondary"
      >
        Редактировать
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={busy}
        className="btn-secondary text-apple-text-secondary"
      >
        Отмена
      </button>
    </div>
  );
}
