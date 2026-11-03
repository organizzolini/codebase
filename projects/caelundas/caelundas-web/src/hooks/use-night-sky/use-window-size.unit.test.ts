import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RESIZE_DEBOUNCE_MILLISECONDS } from "./night-sky.constants";
import { useWindowSize } from "./use-window-size";

describe(useWindowSize, () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns its result", () => {
    const { result } = renderHook(() => useWindowSize());

    expect(result.current).toStrictEqual({
      size: { height: globalThis.innerHeight, width: globalThis.innerWidth },
    });
  });

  it("measures again once a resize has settled", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useWindowSize());

    act(() => {
      vi.spyOn(globalThis, "innerWidth", "get").mockReturnValue(500);
      globalThis.dispatchEvent(new Event("resize"));
      vi.advanceTimersByTime(RESIZE_DEBOUNCE_MILLISECONDS);
    });

    expect(result.current.size?.width).toBe(500);
  });
});
