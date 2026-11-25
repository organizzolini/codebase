import { render, renderHook, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useScrollExpandedToTop } from "./use-scroll-expanded-to-top";

import type { ReactNode } from "react";

interface Tree {
  row: HTMLElement;
  scrollBy: ReturnType<typeof vi.fn<(options: ScrollToOptions) => void>>;
  viewport: HTMLElement;
}

function getElement(container: HTMLElement, selector: string): HTMLElement {
  const element = container.querySelector<HTMLElement>(selector);

  if (element === null) {
    throw new Error(`Nothing matches ${selector}`);
  }

  return element;
}

function Menu(properties: { search?: string | undefined }): ReactNode {
  const { reference } = useScrollExpandedToTop();

  return createElement(
    "div",
    { ref: reference },
    createElement("input", { readOnly: true, value: properties.search ?? "" }),
    createElement(
      "div",
      { "data-slot": "scroll-area-viewport" },
      createElement("div", { "aria-expanded": "false", role: "treeitem" }),
    ),
  );
}

function setUp(
  options: { height?: number; rowTop?: number; search?: string } = {},
): Tree {
  const { container } = render(createElement(Menu, { search: options.search }));
  const viewport = getElement(container, '[data-slot="scroll-area-viewport"]');
  const row = getElement(container, '[role="treeitem"]');
  const scrollBy = vi.fn<(options: ScrollToOptions) => void>();

  Object.defineProperty(viewport, "clientHeight", { value: 100 });
  Object.defineProperty(viewport, "scrollHeight", {
    value: options.height ?? 400,
  });
  Object.defineProperty(viewport, "scrollBy", { value: scrollBy });
  vi.spyOn(viewport, "getBoundingClientRect").mockReturnValue({
    top: 10,
  } as DOMRect);
  vi.spyOn(row, "getBoundingClientRect").mockReturnValue({
    top: options.rowTop ?? 70,
  } as DOMRect);

  return { row, scrollBy, viewport };
}

function stubMotion(isReduced: boolean): void {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: isReduced })),
  );
}

describe(useScrollExpandedToTop, () => {
  beforeEach(() => {
    stubMotion(false);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns its result", () => {
    const { result } = renderHook(() => useScrollExpandedToTop());

    expect(result.current).toStrictEqual({ reference: { current: null } });
  });

  it("scrolls a branch smoothly to the top of its list when it opens", async () => {
    const { row, scrollBy } = setUp();

    row.setAttribute("aria-expanded", "true");

    await waitFor(() => {
      expect(scrollBy).toHaveBeenCalledWith({ behavior: "smooth", top: 60 });
    });
  });

  it("aligns the row holding a branch's handle, in a plain scrolling list", async () => {
    function Editor(): ReactNode {
      const { reference } = useScrollExpandedToTop();

      return createElement(
        "div",
        { ref: reference },
        createElement(
          "div",
          { "data-scroll-list": "" },
          createElement(
            "div",
            { role: "option" },
            createElement("button", { "aria-expanded": "false" }),
          ),
        ),
      );
    }
    const { container } = render(createElement(Editor));
    const list = getElement(container, "[data-scroll-list]");
    const option = getElement(container, '[role="option"]');
    const handle = getElement(container, "button");
    const scrollBy = vi.fn<(options: ScrollToOptions) => void>();

    Object.defineProperty(list, "scrollHeight", { value: 400 });
    Object.defineProperty(list, "scrollBy", { value: scrollBy });
    vi.spyOn(list, "getBoundingClientRect").mockReturnValue({
      top: 0,
    } as DOMRect);
    vi.spyOn(option, "getBoundingClientRect").mockReturnValue({
      top: 80,
    } as DOMRect);
    handle.setAttribute("aria-expanded", "true");

    await waitFor(() => {
      expect(scrollBy).toHaveBeenCalledWith({ behavior: "smooth", top: 80 });
    });
  });

  it("scrolls without animation for a visitor who asked for less motion", async () => {
    stubMotion(true);
    const { row, scrollBy } = setUp();

    row.setAttribute("aria-expanded", "true");

    await waitFor(() => {
      expect(scrollBy).toHaveBeenCalledWith({ behavior: "auto", top: 60 });
    });
  });

  it("scrolls back up when the branch sits above the top", async () => {
    const { row, scrollBy } = setUp({ rowTop: -20 });

    row.setAttribute("aria-expanded", "true");

    await waitFor(() => {
      expect(scrollBy).toHaveBeenCalledWith({ behavior: "smooth", top: -30 });
    });
  });

  it("leaves a branch already at the top where it is", async () => {
    const { row, scrollBy } = setUp({ rowTop: 10 });

    row.setAttribute("aria-expanded", "true");
    await Promise.resolve();

    expect(scrollBy).not.toHaveBeenCalled();
  });

  it("leaves a list short enough to fit where it is", async () => {
    const { row, scrollBy } = setUp({ height: 100 });

    row.setAttribute("aria-expanded", "true");
    await Promise.resolve();

    expect(scrollBy).not.toHaveBeenCalled();
  });

  it("does not scroll when a branch closes", async () => {
    const { row, scrollBy } = setUp();

    row.setAttribute("aria-expanded", "true");
    await waitFor(() => {
      expect(scrollBy).toHaveBeenCalledTimes(1);
    });
    row.setAttribute("aria-expanded", "false");
    await Promise.resolve();

    expect(scrollBy).toHaveBeenCalledTimes(1);
  });

  it("does not scroll while a search holds branches open", async () => {
    const { row, scrollBy } = setUp({ search: "Moon" });

    row.setAttribute("aria-expanded", "true");
    await Promise.resolve();

    expect(scrollBy).not.toHaveBeenCalled();
  });
});
