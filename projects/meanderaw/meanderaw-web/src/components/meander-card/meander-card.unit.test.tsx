import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MeanderCard } from "./meander-card";

import type { GalleryMeander } from "../meander-gallery/meanders-api.types";

const MEANDER: GalleryMeander = {
  characteristics: [
    { isPattern: true, key: "isChain", value: 1 },
    { isPattern: false, key: "junctionCount", value: 3 },
  ],
  code: "01x01y0",
  columns: 3,
  id: "id-1",
  isHardcoded: true,
  lattice: "0",
  repeats: 2,
  rows: 2,
  svg: "<svg></svg>",
};

describe(MeanderCard, () => {
  it("applies its class name", () => {
    render(
      <MeanderCard
        className="meander-card"
        meander={MEANDER}
        view="grid"
      />,
    );

    expect(screen.getByTestId("meander-card").className).toBe("meander-card");
  });

  it("shows the shape, the badge, the Code and the pattern characteristics", () => {
    render(
      <MeanderCard
        meander={MEANDER}
        view="grid"
      />,
    );

    expect(screen.getByText("2 × 3")).toBeDefined();
    expect(screen.getByText("Hardcoded")).toBeDefined();
    expect(screen.getByText("01x01y0")).toBeDefined();
    expect(
      screen.getAllByRole("listitem").map((item) => item.textContent),
    ).toStrictEqual(["isChain"]);
    expect(screen.getByRole("img").getAttribute("src")).toMatch(
      /^data:image\/svg\+xml/u,
    );
  });

  it("leaves the badge off a meander that is not hardcoded", () => {
    render(
      <MeanderCard
        meander={{ ...MEANDER, isHardcoded: false }}
        view="list"
      />,
    );

    expect(screen.queryByText("Hardcoded")).toBeNull();
  });

  it("lists every value in the expander", () => {
    render(
      <MeanderCard
        meander={MEANDER}
        view="list"
      />,
    );

    expect(screen.getByText("All values (2)")).toBeDefined();
    expect(screen.getByText("junctionCount")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
  });

  it("copies the Code, then says so", () => {
    vi.useFakeTimers();
    const writeText = vi.fn<(text: string) => Promise<void>>(async () => {});
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(
      <MeanderCard
        meander={MEANDER}
        view="grid"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Copy the Code/u }));

    expect(writeText).toHaveBeenCalledWith("01x01y0");
    expect(screen.getByText("Copied")).toBeDefined();

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByText("Copy")).toBeDefined();

    vi.useRealTimers();
  });
});
