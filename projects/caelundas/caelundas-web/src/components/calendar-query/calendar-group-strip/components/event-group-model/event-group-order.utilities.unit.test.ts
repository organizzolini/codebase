import { describe, expect, it } from "vitest";

import { compareNatural } from "./event-group-order.utilities";

describe(compareNatural, () => {
  it("counts digits as numbers", () => {
    const names = ["Harmonic 10", "Harmonic 2", "Harmonic 1", "Harmonic 12"];

    expect(names.toSorted(compareNatural)).toStrictEqual([
      "Harmonic 1",
      "Harmonic 2",
      "Harmonic 10",
      "Harmonic 12",
    ]);
  });

  it("orders letters alphabetically", () => {
    expect(["Venus", "Mars"].toSorted(compareNatural)).toStrictEqual([
      "Mars",
      "Venus",
    ]);
  });

  it("puts a parent before the names beneath it, and keeps them together", () => {
    const paths = [
      "Aspect Harmonic / Harmonic 10",
      "Aspect Harmonic",
      "Aspect Harmonic / Harmonic 2",
    ];

    expect(paths.toSorted(compareNatural)).toStrictEqual([
      "Aspect Harmonic",
      "Aspect Harmonic / Harmonic 2",
      "Aspect Harmonic / Harmonic 10",
    ]);
  });

  it("finds equal text equal", () => {
    expect(compareNatural("Mars", "Mars")).toBe(0);
  });

  it("puts a path after the parent it runs through", () => {
    expect(compareNatural("A / B", "A")).toBe(1);
    expect(compareNatural("A", "A / B")).toBe(-1);
  });
});
