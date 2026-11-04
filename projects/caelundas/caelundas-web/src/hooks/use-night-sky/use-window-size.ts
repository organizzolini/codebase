import { useEffect, useState } from "react";

import { RESIZE_DEBOUNCE_MILLISECONDS } from "./night-sky.constants";

import type { UseWindowSizeResult, WindowSize } from "./use-window-size.types";

// 🧩 Hook

/**
 * The window's size, read after mount and again once a resize has settled.
 */
export function useWindowSize(): UseWindowSizeResult {
  // 🪝 Hooks
  const [size, setSize] = useState<WindowSize>();

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const measure = (): void => {
      setSize({ height: window.innerHeight, width: window.innerWidth });
    };
    const handleResize = (): void => {
      clearTimeout(timer);
      timer = setTimeout(measure, RESIZE_DEBOUNCE_MILLISECONDS);
    };

    measure();
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 🎁 Result
  return { size };
}
