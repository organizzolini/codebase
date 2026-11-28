import { describe, expect, it } from "vitest";

import { compareRankedPaths } from "./natural-order.utilities";

import type { RankedName } from "./natural-order.types";

/** A path of levels with no order of their own. */
function path(...names: string[]): RankedName[] {
  return names.map((name) => ({ name, rank: 0 }));
}

describe(compareRankedPaths, () => {
  it("counts digits as numbers", () => {
    expect(
      [path("Harmonic 10"), path("Harmonic 2"), path("Harmonic 1")]
        .toSorted(compareRankedPaths)
        .map(([level]) => level?.name),
    ).toStrictEqual(["Harmonic 1", "Harmonic 2", "Harmonic 10"]);
  });

  it("keeps a parent before the names beneath it, and them together", () => {
    expect(
      [path("A", "Harmonic 10"), path("A"), path("A", "Harmonic 2")]
        .toSorted(compareRankedPaths)
        .map((levels) => levels.map(({ name }) => name).join(" / ")),
    ).toStrictEqual(["A", "A / Harmonic 2", "A / Harmonic 10"]);
  });

  it("puts siblings in their rank before their names", () => {
    expect(
      [
        [{ name: "Apple", rank: 2 }],
        [{ name: "Zebra", rank: 1 }],
        [{ name: "Mango", rank: 3 }],
      ]
        .toSorted(compareRankedPaths)
        .map(([level]) => level?.name),
    ).toStrictEqual(["Zebra", "Apple", "Mango"]);
  });

  it("keeps a parent's rank over its children's", () => {
    expect(
      [
        [
          { name: "B", rank: 1 },
          { name: "x", rank: 1 },
        ],
        [
          { name: "A", rank: 2 },
          { name: "x", rank: 1 },
        ],
      ]
        .toSorted(compareRankedPaths)
        .map(([level]) => level?.name),
    ).toStrictEqual(["B", "A"]);
  });

  it("finds equal paths equal", () => {
    expect(compareRankedPaths(path("Mars"), path("Mars"))).toBe(0);
  });

  it("puts a path after the parent it runs through", () => {
    expect(compareRankedPaths(path("A", "B"), path("A"))).toBe(1);
    expect(compareRankedPaths(path("A"), path("A", "B"))).toBe(-1);
  });
});
