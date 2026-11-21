import { fireEvent, render, screen } from "@testing-library/react";
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
        activeKeys={[]}
        catalog={CATALOG}
        characteristics={HELD}
        className="meander-characteristics"
      />,
    );

    expect(screen.getByTestId("meander-characteristics").className).toBe(
      "meander-characteristics",
    );
  });

  it("lists every characteristic as a pill by name in one list", () => {
    render(
      <MeanderCharacteristics
        activeKeys={[]}
        catalog={CATALOG}
        characteristics={HELD}
      />,
    );

    expect(
      screen.getAllByRole("listitem").map((pill) => pill.textContent),
    ).toStrictEqual(["Chain", "Closed", "Junction count 3", "Mystery 2"]);
    expect(screen.queryAllByRole("group")).toHaveLength(0);
  });

  it("shows a number's value and a boolean's name alone, with the catalog's description as the title", () => {
    render(
      <MeanderCharacteristics
        activeKeys={[]}
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

  describe("past four", () => {
    const MANY = [
      ...HELD,
      { isPattern: false, key: "zeta", name: "Zeta", value: 9 },
      { isPattern: false, key: "alpha", name: "Alpha", value: 8 },
    ];

    it("shows the first four by name, and the rest under a +N pill", () => {
      render(
        <MeanderCharacteristics
          activeKeys={[]}
          catalog={CATALOG}
          characteristics={MANY}
        />,
      );

      expect(
        screen.getAllByRole("listitem").map((pill) => pill.textContent),
      ).toStrictEqual(["Alpha 8", "Chain", "Closed", "Junction count 3", "+2"]);
    });

    it("lists the rest in a tooltip when the +N pill is hovered or focused", async () => {
      render(
        <MeanderCharacteristics
          activeKeys={[]}
          catalog={CATALOG}
          characteristics={MANY}
        />,
      );

      const more = screen.getByRole("button", {
        name: "2 more characteristics",
      });

      fireEvent.focus(more);

      const rest = await screen.findByTestId("hidden-characteristics");

      expect(
        [...rest.querySelectorAll("li")].map((item) => item.textContent),
      ).toStrictEqual(["Mystery 2", "Zeta 9"]);
    });

    it("puts the active characteristics first and always shows them, past four, the rest under +N", () => {
      render(
        <MeanderCharacteristics
          activeKeys={["zeta", "mystery", "junctionCount", "alpha", "isClosed"]}
          catalog={CATALOG}
          characteristics={MANY}
        />,
      );

      expect(
        screen.getAllByRole("listitem").map((pill) => pill.textContent),
      ).toStrictEqual([
        "Alpha 8",
        "Closed",
        "Junction count 3",
        "Mystery 2",
        "Zeta 9",
        "+1",
      ]);
    });

    it("fills up to four with the others by name when few are active", () => {
      render(
        <MeanderCharacteristics
          activeKeys={["zeta"]}
          catalog={CATALOG}
          characteristics={MANY}
        />,
      );

      expect(
        screen.getAllByRole("listitem").map((pill) => pill.textContent),
      ).toStrictEqual(["Zeta 9", "Alpha 8", "Chain", "Closed", "+2"]);
    });
  });

  it("shows nothing for a meander that holds none", () => {
    render(
      <MeanderCharacteristics
        activeKeys={[]}
        catalog={CATALOG}
        characteristics={[]}
      />,
    );

    expect(screen.queryByTestId("meander-characteristics")).toBeNull();
  });
});
