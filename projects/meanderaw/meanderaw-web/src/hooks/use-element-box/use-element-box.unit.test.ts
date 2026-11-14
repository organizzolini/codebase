import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { setViewportWidth } from "../../../testing/viewport";

import { useElementBox } from "./use-element-box";

describe(useElementBox, () => {
  it("returns its result", () => {
    const { result } = renderHook(() => useElementBox());

    expect(result.current).toStrictEqual({
      setElement: result.current.setElement,
      top: 0,
      width: 0,
    });
  });

  it("measures an element handed to it, and measures again when it resizes", () => {
    setViewportWidth(640);
    const { result } = renderHook(() => useElementBox());

    act(() => {
      result.current.setElement(document.createElement("div"));
    });

    expect(result.current.width).toBe(640);
  });

  it("stops watching an element it lets go of", () => {
    const { result } = renderHook(() => useElementBox());

    act(() => {
      result.current.setElement(document.createElement("div"));
    });
    act(() => {
      result.current.setElement(null);
    });

    expect(result.current.width).toBe(1280);
  });
});
