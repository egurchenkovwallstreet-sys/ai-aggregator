import Link from "next/link";

/** Шапка продукта на главной (7.1). */
export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            AI-агрегатор
          </p>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
            Генерация контента
          </h1>
        </div>
        <nav aria-label="Аккаунт" className="flex shrink-0 gap-2">
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Вход
          </Link>
          <Link
            href="/profile"
            className="inline-flex min-h-11 items-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Профиль
          </Link>
        </nav>
      </div>
    </header>
  );
}
