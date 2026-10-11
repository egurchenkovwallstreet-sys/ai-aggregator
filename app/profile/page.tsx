import { Suspense } from "react";

import { ProfileView } from "@/components/profile/ProfileView";

export default function ProfilePage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-12 sm:py-16">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Профиль
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Баланс, аккаунт и реферальный код.
        </p>
      </header>

      <Suspense
        fallback={
          <p className="mt-8 text-sm text-zinc-500" aria-live="polite">
            Загрузка профиля…
          </p>
        }
      >
        <ProfileView />
      </Suspense>
    </div>
  );
}
