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

  useEffect(() => {
    setDraft(prompt);
    setEditing(false);
    setEmptyError(false);
  }, [prompt]);

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
      className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6"
    >
      <h2
        id={titleId}
        className="text-lg font-semibold tracking-tight text-zinc-900"
      >
        Финальный промпт
      </h2>
      <p id={hintId} className="mt-1 text-sm leading-relaxed text-zinc-600">
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
      <blockquote className="mt-5 rounded-xl bg-zinc-50 px-4 py-3 text-base leading-relaxed text-zinc-900">
        {draft}
      </blockquote>
    );
  }

  return (
    <div className="mt-5">
      <label htmlFor={fieldId} className="text-sm font-medium text-zinc-800">
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
        className="mt-2 min-h-32 w-full resize-y rounded-xl border border-zinc-300 bg-white px-3 py-2 text-base leading-relaxed text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
      />
      <p className="mt-1 text-xs tabular-nums text-zinc-500">
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
  const buttonClass =
    "inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:opacity-60";

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
        className={`${buttonClass} bg-zinc-900 text-white hover:bg-zinc-800`}
      >
        {busy ? "Подтверждаем…" : "Подтвердить"}
      </button>
      <button
        type="button"
        onClick={onToggleEdit}
        disabled={busy}
        aria-pressed={editing}
        className={`${buttonClass} border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50`}
      >
        Редактировать
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={busy}
        className={`${buttonClass} text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900`}
      >
        Отмена
      </button>
    </div>
  );
}
