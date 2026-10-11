import Link from "next/link";

/** Шапка главной — sticky glass, Apple-style (7.x). */
export function SiteHeader() {
  return (
    <header className="glass-nav sticky top-0 z-50">
      <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-4 px-[22px] py-3 sm:py-4">
        <div className="min-w-0">
          <Link
            href="/"
            className="text-lg font-semibold tracking-[-0.02em] text-apple-text sm:text-xl"
          >
            AI-агрегатор
          </Link>
          <p className="truncate text-sm text-apple-text-secondary">
            Нейросети для изображений, видео, музыки и текста
          </p>
        </div>
        <nav aria-label="Аккаунт" className="flex shrink-0 items-center gap-2">
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-apple-accent hover:underline"
          >
            Вход
          </Link>
          <Link href="/profile" className="btn-primary px-5">
            Профиль
          </Link>
        </nav>
      </div>
    </header>
  );
}
