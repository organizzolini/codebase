import { describe, expect, it } from "vitest";

import { aspects } from "../../../caelundas/caelundas.constants";

import { TAG_EXTRA_PARENTS } from "./tag-metadata-parents.constants";

/** The other parents of the node at `key`, as joined paths. */
function parentsOf(key: string): string[] {
  return (TAG_EXTRA_PARENTS[key] ?? []).map((path) => path.join(" / "));
}

describe("tag extra parents", () => {
  it("lists a sign under its element, modality and polarity", () => {
    expect(parentsOf("Sign / Aries")).toStrictEqual([
      "Sign / Element / Fire",
      "Sign / Modality / Cardinal",
      "Sign / Polarity / Positive",
    ]);
    expect(parentsOf("Sign / Pisces")).toStrictEqual([
      "Sign / Element / Water",
      "Sign / Modality / Mutable",
      "Sign / Polarity / Negative",
    ]);
  });

  it("lists each fortunate planet under Benefic and each difficult one under Malefic, beside its reach", () => {
    expect(parentsOf("Body / Planet / Personal / Venus")).toStrictEqual([
      "Body / Planet / Benefic",
    ]);
    expect(parentsOf("Body / Planet / Social / Jupiter")).toStrictEqual([
      "Body / Planet / Benefic",
    ]);
    expect(parentsOf("Body / Planet / Personal / Mars")).toStrictEqual([
      "Body / Planet / Malefic",
    ]);
    expect(parentsOf("Body / Planet / Social / Saturn")).toStrictEqual([
      "Body / Planet / Malefic",
    ]);
    expect(parentsOf("Body / Planet / Personal / Mercury")).toStrictEqual([]);
  });

  it("lists every simple aspect under its nature and harmonic", () => {
    const listed = Object.keys(TAG_EXTRA_PARENTS).filter((key) =>
      key.startsWith("Aspect / Simple / "),
    );

    expect(listed).toHaveLength(aspects.length);
    expect(parentsOf("Aspect / Simple / Major / Square")).toStrictEqual([
      "Aspect / Nature / Hard",
      "Aspect / Harmonic / Harmonic 4",
    ]);
    expect(parentsOf("Aspect / Simple / Specialty / Biquintile")).toStrictEqual(
      ["Aspect / Nature / Soft", "Aspect / Harmonic / Harmonic 5"],
    );
  });

  it("lists a compound pattern, and the stellium class, under its nature and harmonic", () => {
    expect(parentsOf("Aspect / Compound / Triple / T Square")).toStrictEqual([
      "Aspect / Nature / Hard",
      "Aspect / Harmonic / Harmonic 4",
    ]);
    expect(parentsOf("Aspect / Compound / Stellium")).toStrictEqual([
      "Aspect / Nature / Neutral",
      "Aspect / Harmonic / Harmonic 1",
    ]);
    expect(parentsOf("Aspect / Compound / Triple")).toStrictEqual([]);
  });

  it("lists a solar point under its season", () => {
    expect(
      parentsOf("Solar / Annual Cycle / Equinox / Vernal Equinox"),
    ).toStrictEqual(["Solar / Season / Spring"]);
    expect(
      parentsOf("Solar / Annual Cycle / Cross-Quarter Day / Samhain"),
    ).toStrictEqual(["Solar / Season / Autumn"]);
  });

  it("never lists a node under itself, a node beneath it or its own parent, nor twice under one parent", () => {
    const bad = Object.entries(TAG_EXTRA_PARENTS).filter(([key, parents]) => {
      const joined = parents.map((path) => path.join(" / "));
      const depth = key.split(" / ").length;

      return (
        new Set(joined).size !== joined.length ||
        joined.some(
          (parent) =>
            parent === key ||
            parent.startsWith(`${key} / `) ||
            (key.startsWith(`${parent} / `) &&
              parent.split(" / ").length === depth - 1),
        )
      );
    });

    expect(bad).toStrictEqual([]);
  });
});
