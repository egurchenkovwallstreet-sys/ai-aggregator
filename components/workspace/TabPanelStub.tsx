import type { ContentTabDefinition } from "@/lib/workspace/content-tabs";

type TabPanelStubProps = {
  tab: ContentTabDefinition;
};

/** Заглушка вкладки до полного UI (7.3–7.5). */
export function TabPanelStub({ tab }: TabPanelStubProps) {
  return (
    <section
      role="tabpanel"
      id={`panel-${tab.id}`}
      aria-labelledby={`tab-${tab.id}`}
      className="apple-panel p-6 sm:p-10"
    >
      <h2 className="text-2xl font-semibold tracking-[-0.03em] text-apple-text">
        {tab.headline}
      </h2>
      <p className="mt-3 max-w-xl text-base leading-[1.85] text-apple-text-body">
        {tab.description}
      </p>
      <div className="mt-8 rounded-[18px] border border-dashed apple-divider bg-apple-bg px-6 py-12 text-center">
        <p className="text-sm text-apple-text-body">
          Интерфейс вкладки появится в задачах 7.3–7.5.
        </p>
        <p className="mt-2 text-xs text-apple-text-tertiary">
          Генерация — этап 5 · оплата — этап 6
        </p>
      </div>
    </section>
  );
}
