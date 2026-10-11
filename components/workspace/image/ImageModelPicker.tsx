"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { ImageModelOption } from "@/lib/catalog/image-models";

type ImageModelPickerProps = {
  models: ImageModelOption[];
  value: string;
  labelId: string;
  onChange: (id: string) => void;
};

/** Выбор модели без нативного `<select>` (Windows-меню ломает премиум-UI). */
export function ImageModelPicker({
  models,
  value,
  labelId,
  onChange,
}: ImageModelPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const triggerId = useId();
  const selected = models.find((m) => m.id === value) ?? models[0];

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative mt-2">
      <button
        type="button"
        id={triggerId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelId}
        onClick={() => setOpen((prev) => !prev)}
        className="field-control flex w-full items-center justify-between gap-3 py-3 text-left text-[0.9375rem] font-medium tracking-[-0.01em]"
      >
        <span className="truncate">{selected?.label}</span>
        <Chevron open={open} />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-[18px] border border-[var(--apple-hairline)] bg-apple-surface py-2 shadow-[var(--apple-shadow-panel)]"
        >
          {models.map((model) => {
            const isSelected = model.id === value;
            return (
              <li key={model.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(model.id);
                    setOpen(false);
                  }}
                  className={`flex w-full min-h-11 items-center justify-between gap-3 px-4 py-2.5 text-left text-[0.9375rem] tracking-[-0.01em] transition-colors ${
                    isSelected
                      ? "bg-apple-accent/10 font-medium text-apple-accent"
                      : "text-apple-text-body hover:bg-apple-bg"
                  }`}
                >
                  <span>{model.label}</span>
                  {isSelected ? <CheckMark /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden
      className={`shrink-0 text-apple-text-tertiary transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M4 6l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckMark() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
