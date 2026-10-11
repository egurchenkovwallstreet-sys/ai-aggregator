import Link from "next/link";

import { ReferralCodeCopy } from "@/components/profile/ReferralCodeCopy";
import { LogoutButton } from "@/components/profile/LogoutButton";
import { getSessionUserId } from "@/server/auth/session";
import { getProfileByUserId } from "@/server/auth/profile";
import {
  isRegisteredSession,
  SESSION_COOKIE,
  verifySession,
} from "@/lib/auth/session-token";
import { cookies } from "next/headers";

function accountLabel(profile: {
  email: string | null;
  telegramId: number | null;
}): string {
  if (profile.email) {
    return profile.email;
  }
  if (profile.telegramId != null) {
    return `Telegram · ${profile.telegramId}`;
  }
  return "Аккаунт";
}

export async function ProfileView() {
  const userId = await getSessionUserId();
  if (!userId) {
    return (
      <p className="mt-8 text-sm text-zinc-600">
        Сессия не найдена.{" "}
        <Link href="/login" className="underline underline-offset-2">
          Войти
        </Link>
      </p>
    );
  }

  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session || !isRegisteredSession(session)) {
    return (
      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-medium">Нужен вход по email или Telegram</p>
        <p className="mt-1 text-amber-900/90">
          Гостевой режим по устройству не открывает профиль. Привяжите аккаунт,
          чтобы сохранять баланс и историю.
        </p>
        <Link
          href="/login?next=/profile"
          className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white"
        >
          Войти
        </Link>
      </div>
    );
  }

  const profile = await getProfileByUserId(userId);
  if (!profile) {
    return (
      <p className="mt-8 text-sm text-red-700" role="alert">
        Не удалось загрузить профиль.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <section className="rounded-xl border border-zinc-200 p-5">
        <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Кошелёк
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-3xl font-semibold tabular-nums text-zinc-900">
              {profile.credits}
            </p>
            <p className="text-sm text-zinc-600">кредитов (₽)</p>
          </div>
          <div>
            <p className="text-3xl font-semibold tabular-nums text-zinc-900">
              {profile.freeGenerationsLeft}
            </p>
            <p className="text-sm text-zinc-600">
              бесплатных из {profile.freeGenerationsTotal}
            </p>
          </div>
        </div>
        <p className="mt-4 text-xs text-zinc-500">
          Сначала тратятся бесплатные генерации, затем кредиты. Цена видна до
          запуска.
        </p>
      </section>

      <section className="rounded-xl border border-zinc-200 p-5">
        <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Аккаунт
        </h2>
        <p className="mt-3 text-lg font-medium text-zinc-900">
          {accountLabel(profile)}
        </p>
        <dl className="mt-4 space-y-2 text-sm">
          {profile.email ? (
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Email</dt>
              <dd className="text-zinc-900">{profile.email}</dd>
            </div>
          ) : null}
          {profile.telegramId != null ? (
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Telegram</dt>
              <dd className="text-zinc-900">{profile.telegramId}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="rounded-xl border border-zinc-200 p-5">
        <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Реферальный код
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          Поделитесь кодом — программа заработка подключится на этапе 8.
        </p>
        <div className="mt-4">
          <ReferralCodeCopy code={profile.referralCode} />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <LogoutButton />
        <Link
          href="/"
          className="text-sm text-zinc-600 underline-offset-2 hover:underline"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
