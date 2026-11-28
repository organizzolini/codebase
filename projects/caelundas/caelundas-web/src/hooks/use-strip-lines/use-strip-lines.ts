import { useLayoutEffect, useRef as useReference } from "react";

import { getBoxElement, markStripLines } from "./use-strip-lines.utilities";

import type { UseStripLinesResult } from "./use-strip-lines.types";

// 🧩 Hook

/**
 * Marks which items of the strip begin and end a line as it wraps; pass false while the strip is not drawn.
 */
export function useStripLines(isDrawn = true): UseStripLinesResult {
  // 🪝 Hooks
  const reference = useReference<HTMLDivElement>(null);

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle
  useLayoutEffect(() => {
    const root = reference.current;

    if (!isDrawn || root === null) {
      return () => {};
    }

    const update = (): void => {
      markStripLines(root);
    };
    const resizeObserver = new ResizeObserver(update);
    const mutationObserver = new MutationObserver(update);

    resizeObserver.observe(getBoxElement(root));
    mutationObserver.observe(root, { childList: true, subtree: true });
    update();

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [isDrawn, reference]);

  // 🎁 Result
  return { reference };
}
