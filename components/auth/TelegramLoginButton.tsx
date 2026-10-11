"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { sanitizeNextPath } from "@/lib/auth/safe-next-path";

type TelegramWidgetUser = {
  id: number;
  auth_date: number;
  hash: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramWidgetUser) => void;
  }
}

const WIDGET_SCRIPT = "https://telegram.org/js/telegram-widget.js?22";

export function TelegramLoginButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim();
  const containerRef = useRef<HTMLDivElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!botUsername) {
      return;
    }

    window.onTelegramAuth = async (user) => {
      setErrorMessage(null);
      const response = await fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setErrorMessage(data.error ?? "Не удалось войти через Telegram.");
        return;
      }

      const next = sanitizeNextPath(searchParams.get("next")) ?? "/";
      router.push(next);
      router.refresh();
    };

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const script = document.createElement("script");
    script.src = WIDGET_SCRIPT;
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    container.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
      container.replaceChildren();
    };
  }, [botUsername, router, searchParams]);

  if (!botUsername) {
    return (
      <p className="text-center text-sm text-zinc-500">
        Telegram-вход недоступен: задайте NEXT_PUBLIC_TELEGRAM_BOT_USERNAME.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={containerRef} className="min-h-11" />
      {errorMessage ? (
        <p className="text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
