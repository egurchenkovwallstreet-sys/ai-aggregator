"use client";

import { useState } from "react";

type Props = {
  code: string;
};

export function ReferralCodeCopy({ code }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-sm text-zinc-900">
        {code}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        className="min-h-9 rounded-md bg-zinc-900 px-3 text-xs font-medium text-white"
      >
        {copied ? "Скопировано" : "Копировать"}
      </button>
    </div>
  );
}
