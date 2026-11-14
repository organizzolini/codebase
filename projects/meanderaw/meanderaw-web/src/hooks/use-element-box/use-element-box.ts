import { useEffect, useState } from "react";

import type { UseElementBoxResult } from "./use-element-box.types";

// 🧩 Hook

/**
 * Measures an element as it appears and as it is resized: its width, and its
 * distance from the top of the page.
 */
export function useElementBox(): UseElementBoxResult {
  // 🪝 Hooks
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [box, setBox] = useState({ top: 0, width: 0 });

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const { target } of entries) {
        const { top, width } = target.getBoundingClientRect();

        setBox({ top: top + window.scrollY, width });
      }
    });

    if (element !== null) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [element]);

  // 🎁 Result
  return { setElement, top: box.top, width: box.width };
}
