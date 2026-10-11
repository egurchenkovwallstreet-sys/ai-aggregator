import Link from "next/link";
import { Suspense } from "react";

import { LoginErrorBanner } from "@/components/auth/LoginErrorBanner";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";
import { TelegramLoginButton } from "@/components/auth/TelegramLoginButton";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <main className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Вход
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Войдите через Telegram или получите ссылку на email.
        </p>

        <Suspense fallback={null}>
          <LoginErrorBanner />
        </Suspense>

        <Suspense fallback={null}>
          <div className="mt-6">
            <TelegramLoginButton />
          </div>
        </Suspense>

        <div
          className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-zinc-400"
          aria-hidden
        >
          <span className="h-px flex-1 bg-zinc-200" />
          <span>или email</span>
          <span className="h-px flex-1 bg-zinc-200" />
        </div>

        <Suspense fallback={null}>
          <MagicLinkForm />
        </Suspense>

        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link href="/" className="underline-offset-2 hover:underline">
            На главную
          </Link>
        </p>
      </main>
    </div>
  );
}
