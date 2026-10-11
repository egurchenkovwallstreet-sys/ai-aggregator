import type { ContentTabDefinition } from "@/lib/workspace/content-tabs";

type TabPanelStubProps = {
  tab: ContentTabDefinition;
};

/** Заглушка вкладки до этапов 5–7.2 (генерация и полный UI). */
export function TabPanelStub({ tab }: TabPanelStubProps) {
  return (
    <section
      role="tabpanel"
      id={`panel-${tab.id}`}
      aria-labelledby={`tab-${tab.id}`}
      className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Прототип интерфейса
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900">
        {tab.headline}
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-600">
        {tab.description}
      </p>
      <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center">
        <p className="text-sm text-zinc-600">
          Здесь будет выбор модели, агент, цена и результат.
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Генерация — этап 5 · оплата — этап 6 · детальный UI вкладки — 7.2–7.5
        </p>
      </div>
    </section>
  );
}
