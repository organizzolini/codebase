import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { setViewportWidth } from "../../../testing/viewport";

import { useViewportWidth } from "./use-viewport-width";

describe(useViewportWidth, () => {
  it("returns its result", () => {
    const { result } = renderHook(() => useViewportWidth());

    expect(result.current).toStrictEqual({ width: 1280 });
  });

  it("reads the width again when the window resizes", () => {
    const { result } = renderHook(() => useViewportWidth());

    act(() => {
      setViewportWidth(375);
      globalThis.dispatchEvent(new Event("resize"));
    });

    expect(result.current.width).toBe(375);
  });
});
