import { useEffect, useRef as useReference, useState } from "react";

import { END_MARGIN } from "./use-end-reached.constants";

import type { UseEndReachedResult } from "./use-end-reached.types";

// 🧩 Hook

/**
 * Calls back when the element handed to it comes into view, while enabled;
 * enabling it again asks again.
 */
export function useEndReached(
  onReach: () => void,
  isEnabled: boolean,
): UseEndReachedResult {
  // 🪝 Hooks
  const [element, setElement] = useState<Element | null>(null);
  const callback = useReference(onReach);

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle
  useEffect(() => {
    callback.current = onReach;
  }, [onReach]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some(({ isIntersecting }) => isIntersecting)) {
          callback.current();
        }
      },
      { rootMargin: END_MARGIN },
    );

    if (isEnabled && element !== null) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [element, isEnabled]);

  // 🎁 Result
  return { setElement };
}
