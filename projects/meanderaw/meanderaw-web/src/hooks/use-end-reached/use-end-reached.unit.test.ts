import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { reachEnd } from "../../../testing/viewport";

import { useEndReached } from "./use-end-reached";

describe(useEndReached, () => {
  it("returns its result", () => {
    const { result } = renderHook(() =>
      useEndReached(vi.fn<() => void>(), true),
    );

    expect(result.current).toStrictEqual({
      setElement: result.current.setElement,
    });
  });

  it("calls back when the element comes into view", () => {
    const onReach = vi.fn<() => void>();
    const { result } = renderHook(() => useEndReached(onReach, true));

    act(() => {
      result.current.setElement(document.createElement("div"));
    });
    act(() => {
      reachEnd();
    });

    expect(onReach).toHaveBeenCalledExactlyOnceWith();
  });

  it("watches nothing while disabled, or with no element", () => {
    const onReach = vi.fn<() => void>();
    const { rerender, result } = renderHook(
      ({ isEnabled }) => useEndReached(onReach, isEnabled),
      { initialProps: { isEnabled: false } },
    );

    act(() => {
      result.current.setElement(document.createElement("div"));
    });
    act(() => {
      reachEnd();
    });

    expect(onReach).not.toHaveBeenCalled();

    act(() => {
      result.current.setElement(null);
    });
    rerender({ isEnabled: true });
    act(() => {
      reachEnd();
    });

    expect(onReach).not.toHaveBeenCalled();
  });

  it("calls the latest callback, and stops watching when disabled", () => {
    const first = vi.fn<() => void>();
    const second = vi.fn<() => void>();
    const { rerender, result } = renderHook(
      ({ isEnabled, onReach }) => useEndReached(onReach, isEnabled),
      { initialProps: { isEnabled: true, onReach: first } },
    );

    act(() => {
      result.current.setElement(document.createElement("div"));
    });
    rerender({ isEnabled: true, onReach: second });
    act(() => {
      reachEnd();
    });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledExactlyOnceWith();

    rerender({ isEnabled: false, onReach: second });
    act(() => {
      reachEnd();
    });

    expect(second).toHaveBeenCalledExactlyOnceWith();
  });
});
