"use client";

import type {
  ContentTabDefinition,
  ContentTabId,
} from "@/lib/workspace/content-tabs";

type ContentTabBarProps = {
  tabs: ContentTabDefinition[];
  activeId: ContentTabId;
  onChange: (id: ContentTabId) => void;
};

/** Переключатель четырёх вкладок контента (7.1). */
export function ContentTabBar({
  tabs,
  activeId,
  onChange,
}: ContentTabBarProps) {
  return (
    <div
      role="tablist"
      aria-label="Тип контента"
      className="flex gap-1 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-100/80 p-1"
    >
      {tabs.map((tab) => {
        const selected = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`min-h-11 shrink-0 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 ${
              selected
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
