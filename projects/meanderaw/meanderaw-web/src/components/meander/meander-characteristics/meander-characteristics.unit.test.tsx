import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MeanderCharacteristics } from "./meander-characteristics";

import type { GalleryCharacteristic } from "../../gallery/meander-gallery/meanders-api.types";

const CATALOG: GalleryCharacteristic[] = [
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
    description: "Whether it is closed.",
    isPattern: false,
    key: "isClosed",
    meanderCount: 0,
    name: "Closed",
    valueCounts: [],
    valueType: "boolean",
  },
];

const HELD = [
  { isPattern: false, key: "junctionCount", name: "Junction count", value: 3 },
  { isPattern: true, key: "isChain", name: "Chain", value: 1 },
  { isPattern: false, key: "isClosed", name: "Closed", value: 1 },
  { isPattern: false, key: "mystery", name: "Mystery", value: 2 },
];

describe(MeanderCharacteristics, () => {
  it("applies its class name", () => {
    render(
      <MeanderCharacteristics
        catalog={CATALOG}
        characteristics={HELD}
        className="meander-characteristics"
      />,
    );

    expect(screen.getByTestId("meander-characteristics").className).toBe(
      "meander-characteristics",
    );
  });

  it("groups the pills, the patterns first and then each category by name", () => {
    render(
      <MeanderCharacteristics
        catalog={CATALOG}
        characteristics={HELD}
      />,
    );

    expect(
      screen
        .getAllByRole("group")
        .map((group) => group.getAttribute("aria-label")),
    ).toStrictEqual(["Patterns", "Other", "Path"]);
    expect(
      within(screen.getByRole("group", { name: "Path" }))
        .getAllByRole("listitem")
        .map((pill) => pill.textContent),
    ).toStrictEqual(["Closed", "Junction count 3"]);
  });

  it("shows a number's value and a boolean's name alone, with the catalog's description as the title", () => {
    render(
      <MeanderCharacteristics
        catalog={CATALOG}
        characteristics={HELD}
      />,
    );

    expect(
      screen.getByText("Closed").closest("li")?.getAttribute("title"),
    ).toBe("Whether it is closed.");
    expect(screen.getByText("3").tagName).toBe("STRONG");
    expect(screen.getByText("2").tagName).toBe("STRONG");
  });

  it("shows nothing for a meander that holds none", () => {
    render(
      <MeanderCharacteristics
        catalog={CATALOG}
        characteristics={[]}
      />,
    );

    expect(screen.queryAllByRole("group")).toHaveLength(0);
  });
});
