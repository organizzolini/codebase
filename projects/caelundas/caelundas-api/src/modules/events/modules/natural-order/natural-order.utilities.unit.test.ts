import { describe, expect, it } from "vitest";

import { compareNaturalPaths } from "./natural-order.utilities";

describe(compareNaturalPaths, () => {
  it("counts digits as numbers", () => {
    expect(
      ["Harmonic 10", "Harmonic 2", "Harmonic 1"].toSorted(compareNaturalPaths),
    ).toStrictEqual(["Harmonic 1", "Harmonic 2", "Harmonic 10"]);
  });

  it("keeps a parent before the names beneath it, and them together", () => {
    expect(
      ["A / Harmonic 10", "A", "A / Harmonic 2"].toSorted(compareNaturalPaths),
    ).toStrictEqual(["A", "A / Harmonic 2", "A / Harmonic 10"]);
  });

  it("finds equal paths equal", () => {
    expect(compareNaturalPaths("Mars", "Mars")).toBe(0);
  });

  it("puts a path after the parent it runs through", () => {
    expect(compareNaturalPaths("A / B", "A")).toBe(1);
    expect(compareNaturalPaths("A", "A / B")).toBe(-1);
  });
});
