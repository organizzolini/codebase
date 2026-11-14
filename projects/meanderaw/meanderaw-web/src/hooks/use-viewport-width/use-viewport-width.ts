import { useEffect, useState } from "react";

import type { UseViewportWidthResult } from "./use-viewport-width.types";

// 🧩 Hook

/**
 * Reads the width of the browser window, and reads it again as it resizes.
 */
export function useViewportWidth(): UseViewportWidthResult {
  // 🪝 Hooks
  const [width, setWidth] = useState(() => globalThis.innerWidth);

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle
  useEffect(() => {
    const handleResize = (): void => {
      setWidth(globalThis.innerWidth);
    };

    handleResize();
    globalThis.addEventListener("resize", handleResize);

    return () => {
      globalThis.removeEventListener("resize", handleResize);
    };
  }, []);

  // 🎁 Result
  return { width };
}
