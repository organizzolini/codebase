import { describe, expect, it } from "vitest";

import { aspects } from "../../../caelundas/caelundas.constants";

import { TAG_EXTRA_PARENTS } from "./tag-metadata-parents.constants";

/** The other parents of the node at `key`, as joined paths. */
function parentsOf(key: string): string[] {
  return (TAG_EXTRA_PARENTS[key] ?? []).map((path) => path.join(" / "));
}

describe("tag extra parents", () => {
  it("lists a sign under its element, modality and polarity", () => {
    expect(parentsOf("Sign / Zodiac / Aries")).toStrictEqual([
      "Sign / Element / Fire",
      "Sign / Modality / Cardinal",
      "Sign / Polarity / Positive",
    ]);
    expect(parentsOf("Sign / Zodiac / Pisces")).toStrictEqual([
      "Sign / Element / Water",
      "Sign / Modality / Mutable",
      "Sign / Polarity / Negative",
    ]);
  });

  it("lists every planet under Planet itself, and a fortunate or difficult one under Benefic or Malefic too", () => {
    expect(parentsOf("Body / Planet / Inner / Personal / Venus")).toStrictEqual(
      ["Body / Planet", "Body / Planet / Benefic"],
    );
    expect(parentsOf("Body / Planet / Inner / Social / Jupiter")).toStrictEqual(
      ["Body / Planet", "Body / Planet / Benefic"],
    );
    expect(parentsOf("Body / Planet / Inner / Personal / Mars")).toStrictEqual([
      "Body / Planet",
      "Body / Planet / Malefic",
    ]);
    expect(parentsOf("Body / Planet / Inner / Social / Saturn")).toStrictEqual([
      "Body / Planet",
      "Body / Planet / Malefic",
    ]);
    expect(
      parentsOf("Body / Planet / Inner / Personal / Mercury"),
    ).toStrictEqual(["Body / Planet"]);
    expect(parentsOf("Body / Planet / Outer / Pluto")).toStrictEqual([
      "Body / Planet",
    ]);
  });

  it("leaves the Sun and the Moon under Luminary alone", () => {
    expect(parentsOf("Body / Luminary / Sun")).toStrictEqual([]);
    expect(parentsOf("Body / Luminary / Moon")).toStrictEqual([]);
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
    expect(parentsOf("Yearly / Equinox / Vernal Equinox")).toStrictEqual([
      "Yearly / Season / Spring",
    ]);
    expect(parentsOf("Yearly / Cross-Quarter Day / Samhain")).toStrictEqual([
      "Yearly / Season / Autumn",
    ]);
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
