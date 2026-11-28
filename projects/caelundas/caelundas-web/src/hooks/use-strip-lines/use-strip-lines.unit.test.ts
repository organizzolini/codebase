import { render, renderHook } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { useStripLines } from "./use-strip-lines";

import type { ReactNode } from "react";

describe(useStripLines, () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("flags the only item of a strip as both opening and closing its line", () => {
    function Strip(): ReactNode {
      const { reference } = useStripLines();

      return createElement(
        "div",
        { ref: reference },
        createElement("div", { "data-strip-item": "" }),
      );
    }

    const { container } = render(createElement(Strip));
    const item = container.querySelector<HTMLElement>("[data-strip-item]");

    expect(item && Object.hasOwn(item.dataset, "lineEnd")).toBe(true);
    expect(item && Object.hasOwn(item.dataset, "lineStart")).toBe(false);
  });

  it("treats the buttons of a marked group as its items", () => {
    function Strip(): ReactNode {
      const { reference } = useStripLines();

      return createElement(
        "div",
        { ref: reference },
        createElement(
          "div",
          { "data-strip-buttons": "" },
          createElement("button", { "data-slot": "button" }),
          createElement("button", { "data-slot": "button" }),
        ),
      );
    }

    const { container } = render(createElement(Strip));
    const buttons = container.querySelectorAll<HTMLElement>("[data-slot]");

    expect(Object.hasOwn(buttons[1]?.dataset ?? {}, "lineEnd")).toBe(true);
    expect(Object.hasOwn(buttons[0]?.dataset ?? {}, "lineEnd")).toBe(false);
  });

  it("returns its result", () => {
    const { result } = renderHook(() => useStripLines());

    expect(result.current).toStrictEqual({ reference: { current: null } });
  });
});
