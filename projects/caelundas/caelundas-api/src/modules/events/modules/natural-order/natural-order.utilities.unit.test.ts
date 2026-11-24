import { describe, expect, it } from "vitest";

import { compareOrderedPaths } from "./natural-order.utilities";

import type { OrderedName } from "./natural-order.types";

/** A path of levels with no order of their own. */
function path(...names: string[]): OrderedName[] {
  return names.map((name) => ({ name, order: 0 }));
}

describe(compareOrderedPaths, () => {
  it("counts digits as numbers", () => {
    expect(
      [path("Harmonic 10"), path("Harmonic 2"), path("Harmonic 1")]
        .toSorted(compareOrderedPaths)
        .map(([level]) => level?.name),
    ).toStrictEqual(["Harmonic 1", "Harmonic 2", "Harmonic 10"]);
  });

  it("keeps a parent before the names beneath it, and them together", () => {
    expect(
      [path("A", "Harmonic 10"), path("A"), path("A", "Harmonic 2")]
        .toSorted(compareOrderedPaths)
        .map((levels) => levels.map(({ name }) => name).join(" / ")),
    ).toStrictEqual(["A", "A / Harmonic 2", "A / Harmonic 10"]);
  });

  it("puts siblings in their order before their names", () => {
    expect(
      [
        [{ name: "Apple", order: 2 }],
        [{ name: "Zebra", order: 1 }],
        [{ name: "Mango", order: 3 }],
      ]
        .toSorted(compareOrderedPaths)
        .map(([level]) => level?.name),
    ).toStrictEqual(["Zebra", "Apple", "Mango"]);
  });

  it("keeps a parent's order over its children's", () => {
    expect(
      [
        [
          { name: "B", order: 1 },
          { name: "x", order: 1 },
        ],
        [
          { name: "A", order: 2 },
          { name: "x", order: 1 },
        ],
      ]
        .toSorted(compareOrderedPaths)
        .map(([level]) => level?.name),
    ).toStrictEqual(["B", "A"]);
  });

  it("finds equal paths equal", () => {
    expect(compareOrderedPaths(path("Mars"), path("Mars"))).toBe(0);
  });

  it("puts a path after the parent it runs through", () => {
    expect(compareOrderedPaths(path("A", "B"), path("A"))).toBe(1);
    expect(compareOrderedPaths(path("A"), path("A", "B"))).toBe(-1);
  });
});
