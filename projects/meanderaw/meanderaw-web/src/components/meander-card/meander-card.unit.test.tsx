import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MeanderCard } from "./meander-card";

import type {
  GalleryCharacteristic,
  GalleryMeander,
} from "../meander-gallery/meanders-api.types";

const CATALOG: GalleryCharacteristic[] = [
  {
    category: "submatrix",
    description: "Holds a chain.",
    isPattern: true,
    key: "isChain",
    meanderCount: 0,
    name: "Chain",
    valueCounts: [],
    valueType: "boolean",
  },
  {
    category: "path",
    description: "Pieces of ink.",
    isPattern: false,
    key: "junctionCount",
    meanderCount: 0,
    name: "Junction count",
    valueCounts: [],
    valueType: "number",
  },
];

const MEANDER: GalleryMeander = {
  characteristics: [
    { isPattern: true, key: "isChain", name: "Chain", value: 1 },
    {
      isPattern: false,
      key: "junctionCount",
      name: "Junction count",
      value: 3,
    },
  ],
  code: "01x01y0",
  columns: 3,
  id: "id-1",
  isHardcoded: true,
  lattice: "0",
  repeats: 2,
  rows: 2,
  svg: '<svg width="300" height="100" viewBox="0 0 300 100"></svg>',
};

/** Gives `navigator.clipboard` a `writeText`, and returns it. */
function stubClipboard(
  writeText: (text: string) => Promise<void>,
): (text: string) => Promise<void> {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });

  return writeText;
}

describe(MeanderCard, () => {
  it("applies its class name", () => {
    render(
      <MeanderCard
        catalog={CATALOG}
        className="meander-card"
        meander={MEANDER}
        repeats={12}
      />,
    );

    expect(screen.getByTestId("meander-card").className).toBe("meander-card");
  });

  it("shows the Code with the repeats on the end, and no shape line", () => {
    render(
      <MeanderCard
        catalog={CATALOG}
        meander={MEANDER}
        repeats={12}
      />,
    );

    expect(screen.getByRole("code").textContent).toBe("01x01y0r12");
    expect(screen.queryByText(/lattice/u)).toBeNull();
    expect(screen.queryByText(/×/u)).toBeNull();
  });

  it("shows the badge only for a hardcoded meander", () => {
    const { rerender } = render(
      <MeanderCard
        catalog={CATALOG}
        meander={MEANDER}
        repeats={6}
      />,
    );

    expect(screen.getByText("Hardcoded")).toBeDefined();

    rerender(
      <MeanderCard
        catalog={CATALOG}
        meander={{ ...MEANDER, isHardcoded: false }}
        repeats={6}
      />,
    );

    expect(screen.queryByText("Hardcoded")).toBeNull();
  });

  it("keeps the real aspect of the drawing the API made", () => {
    render(
      <MeanderCard
        catalog={CATALOG}
        meander={MEANDER}
        repeats={6}
      />,
    );

    const image = screen.getByRole("img");

    expect(image.getAttribute("src")).toMatch(/^data:image\/svg\+xml/u);
    expect(image.getAttribute("width")).toBe("300");
    expect(image.getAttribute("height")).toBe("100");
    expect(image.style.aspectRatio).toBe("300 / 100");
  });

  it("falls back to a stock aspect for a drawing that names no size", () => {
    render(
      <MeanderCard
        catalog={CATALOG}
        meander={{ ...MEANDER, svg: "<svg></svg>" }}
        repeats={6}
      />,
    );

    expect(screen.getByRole("img").getAttribute("width")).toBe("256");
  });

  it("shows the characteristics as grouped pills", () => {
    render(
      <MeanderCard
        catalog={CATALOG}
        meander={MEANDER}
        repeats={6}
      />,
    );

    expect(
      screen
        .getAllByRole("group")
        .map((group) => group.getAttribute("aria-label")),
    ).toStrictEqual(["Patterns", "Path"]);
    expect(screen.getByText("Junction count").closest("li")?.textContent).toBe(
      "Junction count 3",
    );
  });

  it("copies the Code as shown, with its repeats, then says so, then goes back to Copy", async () => {
    vi.useFakeTimers();
    const writeText = stubClipboard(
      vi.fn<(text: string) => Promise<void>>(async () => {}),
    );
    render(
      <MeanderCard
        catalog={CATALOG}
        meander={MEANDER}
        repeats={12}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Copy the Code/u }));
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalledWith("01x01y0r12");
    expect(screen.getByText("Copied")).toBeDefined();

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByText("Copy")).toBeDefined();

    vi.useRealTimers();
  });

  it("says the copy failed when the clipboard refuses, and does not say Copied", async () => {
    stubClipboard(
      vi
        .fn<(text: string) => Promise<void>>()
        .mockRejectedValue(new Error("denied")),
    );
    render(
      <MeanderCard
        catalog={CATALOG}
        meander={MEANDER}
        repeats={6}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Copy the Code/u }));
      await Promise.resolve();
    });

    expect(screen.getByText("Copy failed")).toBeDefined();
    expect(screen.queryByText("Copied")).toBeNull();
  });

  it("lets go of the notice's timer when the card leaves first", async () => {
    vi.useFakeTimers();
    stubClipboard(vi.fn<(text: string) => Promise<void>>(async () => {}));
    const { unmount } = render(
      <MeanderCard
        catalog={CATALOG}
        meander={MEANDER}
        repeats={6}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Copy the Code/u }));
      await Promise.resolve();
    });
    unmount();

    expect(vi.getTimerCount()).toBe(0);

    vi.useRealTimers();
  });
});
