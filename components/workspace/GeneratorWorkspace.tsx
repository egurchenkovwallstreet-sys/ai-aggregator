"use client";

import { useCallback, useState, type KeyboardEvent } from "react";

import { ContentTabBar } from "@/components/workspace/ContentTabBar";
import { ImageGenerationPanel } from "@/components/workspace/image/ImageGenerationPanel";
import { TabPanelStub } from "@/components/workspace/TabPanelStub";
import {
  CONTENT_TABS,
  type ContentTabId,
  isContentTabId,
} from "@/lib/workspace/content-tabs";

function useTabKeyboard(
  activeId: ContentTabId,
  setActiveId: (id: ContentTabId) => void,
) {
  return useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const index = CONTENT_TABS.findIndex((tab) => tab.id === activeId);
      if (index === -1) return;

      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % CONTENT_TABS.length;
      if (event.key === "ArrowLeft") {
        next = (index - 1 + CONTENT_TABS.length) % CONTENT_TABS.length;
      }
      if (next !== index) {
        event.preventDefault();
        setActiveId(CONTENT_TABS[next].id);
      }
    },
    [activeId, setActiveId],
  );
}

/** Главный экран с четырьмя вкладками. */
export function GeneratorWorkspace() {
  const [activeId, setActiveId] = useState<ContentTabId>("image");
  const onKeyDown = useTabKeyboard(activeId, setActiveId);

  const activeTab =
    CONTENT_TABS.find((tab) => tab.id === activeId) ?? CONTENT_TABS[0];

  return (
    <div className="mx-auto w-full max-w-[1080px] flex-1 px-[22px] pb-12 pt-8 sm:pb-16 sm:pt-10">
      <header className="max-w-2xl">
        <h1 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.03em] text-apple-text sm:text-4xl">
          Генерация контента
        </h1>
        <p className="mt-3 text-base leading-[1.85] text-apple-text-body">
          Опишите задачу на русском — агент соберёт промпт. Цена видна до
          запуска. Подключение моделей и оплаты — на этапах 5–6.
        </p>
      </header>

      <div className="mt-8 sm:mt-10" onKeyDown={onKeyDown}>
        <ContentTabBar
          tabs={CONTENT_TABS}
          activeId={activeId}
          onChange={(id) => {
            if (isContentTabId(id)) setActiveId(id);
          }}
        />
        <div className="mt-6 sm:mt-8">
          {activeId === "image" ? (
            <ImageGenerationPanel key="image-panel" />
          ) : (
            <TabPanelStub tab={activeTab} />
          )}
        </div>
      </div>
    </div>
  );
}
