import { useEffect, useRef as useReference } from "react";

import { watchExpansion } from "./use-scroll-expanded-to-top.utilities";

import type { UseScrollExpandedToTopResult } from "./use-scroll-expanded-to-top.types";

// 🧩 Hook

/**
 * Scrolls a branch to the top of its list when it opens, so its first children show.
 */
export function useScrollExpandedToTop(): UseScrollExpandedToTopResult {
  // 🪝 Hooks
  const reference = useReference<HTMLDivElement>(null);

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle
  useEffect(() => {
    const root = reference.current;

    return root === null ? () => {} : watchExpansion(root);
  }, [reference]);

  // 🎁 Result
  return { reference };
}
