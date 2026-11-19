"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

/**
 * Tabs with roving tabindex and arrow-key navigation (WAI-ARIA tabs pattern).
 */
export function Tabs({
  tabs,
  initial = 0,
}: {
  tabs: { id: string; label: string; panel: ReactNode }[];
  initial?: number;
}) {
  const [active, setActive] = useState(initial);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKey(e: KeyboardEvent, index: number) {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;
    e.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  }

  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-border">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={i === active}
            aria-controls={`panel-${tab.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKey(e, i)}
            className={`min-h-[44px] px-4 text-sm font-medium ${
              i === active
                ? "border-b-2 border-accent text-text"
                : "text-muted hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={i !== active}
          className="py-4"
        >
          {i === active ? tab.panel : null}
        </div>
      ))}
    </div>
  );
}
