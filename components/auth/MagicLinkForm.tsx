"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

type Props = {
  className?: string;
};

export function MagicLinkForm({ className }: Props) {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage(null);

    const response = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        ...(nextPath ? { next: nextPath } : {}),
      }),
    });

    const data = (await response.json()) as {
      error?: string;
      message?: string;
    };

    if (!response.ok) {
      setStatus("error");
      setErrorMessage(data.error ?? "Не удалось отправить ссылку.");
      return;
    }

    setStatus("sent");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={className}
      aria-busy={status === "loading"}
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="login-email"
          className="text-sm font-medium text-zinc-800"
        >
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="min-h-11 rounded-lg border border-zinc-300 px-3 text-base text-zinc-900"
          disabled={status === "loading" || status === "sent"}
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading" || status === "sent"}
        className="mt-4 min-h-11 w-full rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white disabled:opacity-60"
      >
        {status === "loading" ? "Отправляем…" : "Получить ссылку для входа"}
      </button>

      {status === "sent" ? (
        <p className="mt-4 text-sm text-zinc-600" role="status">
          Проверьте почту — мы отправили ссылку для входа.
        </p>
      ) : null}

      {status === "error" && errorMessage ? (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
