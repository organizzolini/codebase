import { useEffect, useState } from "react";

import type { UseViewportWidthResult } from "./use-viewport-width.types";

// 🧩 Hook

/**
 * Reads the width of the browser window, and reads it again as it resizes.
 */
export function useViewportWidth(): UseViewportWidthResult {
  // 🪝 Hooks
  const [width, setWidth] = useState(0);

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle
  useEffect(() => {
    const handleResize = (): void => {
      setWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 🎁 Result
  return { width };
}
