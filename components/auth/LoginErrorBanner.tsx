"use client";

import { useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  missing_token: "В ссылке нет токена. Запросите вход заново.",
  invalid_token: "Ссылка недействительна или уже использована.",
};

export function LoginErrorBanner() {
  const searchParams = useSearchParams();
  const errorKey = searchParams.get("error");
  const errorText = errorKey ? ERROR_MESSAGES[errorKey] : undefined;

  if (!errorText) {
    return null;
  }

  return (
    <p
      className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
      role="alert"
    >
      {errorText}
    </p>
  );
}
