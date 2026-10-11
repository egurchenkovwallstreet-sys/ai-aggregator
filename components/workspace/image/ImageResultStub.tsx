type ImageResultStubProps = {
  promptSummary: string;
  modelLabel: string;
};

/** Заглушка результата до этапа 5.1 (реальная генерация). */
export function ImageResultStub({
  promptSummary,
  modelLabel,
}: ImageResultStubProps) {
  return (
    <section
      className="rounded-2xl border border-zinc-200 bg-white p-5"
      aria-label="Результат генерации"
    >
      <h3 className="text-sm font-medium text-zinc-800">Результат (демо)</h3>
      <div
        className="mt-4 flex aspect-[4/3] items-center justify-center rounded-xl bg-zinc-100"
        role="img"
        aria-label="Заглушка изображения"
      >
        <p className="max-w-xs px-4 text-center text-sm text-zinc-600">
          Здесь появится картинка от {modelLabel} после этапа 5
        </p>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-zinc-500">
        Промпт принят: «{promptSummary.slice(0, 120)}
        {promptSummary.length > 120 ? "…" : ""}»
      </p>
    </section>
  );
}
