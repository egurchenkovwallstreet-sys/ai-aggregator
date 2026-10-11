type ImageResultStubProps = {
  promptSummary: string;
  modelLabel: string;
};

/** Заглушка результата до этапа 5.1. */
export function ImageResultStub({
  promptSummary,
  modelLabel,
}: ImageResultStubProps) {
  return (
    <section
      className="apple-panel p-6 sm:p-8"
      aria-label="Результат генерации"
    >
      <h3 className="text-lg font-semibold tracking-[-0.02em] text-apple-text">
        Результат
      </h3>
      <p className="mt-1 text-sm text-apple-text-secondary">
        Демо-превью · {modelLabel}
      </p>
      <div
        className="mt-5 flex aspect-[4/3] items-center justify-center rounded-[18px] bg-gradient-to-br from-[#0a84ff]/15 via-apple-bg to-[#5e5ce6]/15"
        role="img"
        aria-label="Заглушка изображения"
      >
        <p className="max-w-xs px-6 text-center text-sm leading-relaxed text-apple-text-body">
          Здесь появится картинка после подключения API на этапе 5
        </p>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-apple-text-tertiary">
        Промпт: «{promptSummary.slice(0, 120)}
        {promptSummary.length > 120 ? "…" : ""}»
      </p>
    </section>
  );
}
