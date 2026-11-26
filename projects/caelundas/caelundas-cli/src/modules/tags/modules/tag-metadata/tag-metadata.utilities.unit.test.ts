import { iconNames } from "lucide-react/dynamic";
import { describe, expect, it } from "vitest";

import { CONTEXT_TAG_MAPS, SHARED_TAG_MAP } from "../../tag-map.constants";

import { tagMetadata } from "./tag-metadata.utilities";

/** Every path the tag maps can produce, each with its ancestors. */
function generatedPaths(): string[][] {
  const paths = new Map<string, string[]>();
  const add = (path: readonly string[]): void => {
    for (let length = 1; length <= path.length; length += 1) {
      const prefix = path.slice(0, length);
      paths.set(prefix.join(" / "), prefix);
    }
  };

  for (const map of [SHARED_TAG_MAP, ...Object.values(CONTEXT_TAG_MAPS)]) {
    for (const nodes of Object.values(map)) {
      for (const node of nodes) {
        add(node);
      }
    }
  }

  for (const kind of ["Decan", "Peak", "Sign"]) {
    add(["Zodiac", "Ingress", `${kind} Ingress`]);
  }

  for (const kind of ["Decan", "Peak", "Sign"]) {
    add(["Zodiac", "Ingress", `${kind} Transit`]);
  }

  for (const dignity of [
    "Detriment",
    "Domicile",
    "Exaltation",
    "Fall",
    "Peregrine",
  ]) {
    add(["Zodiac", "Dignity", dignity]);
  }

  for (const type of ["Annular", "Partial", "Total"]) {
    add(["Eclipse", "Solar", type]);
  }

  for (const type of ["Partial", "Total"]) {
    add(["Eclipse", "Lunar", type]);
  }

  add(["Temporality", "Perfective"]);
  add(["Temporality", "Progressive"]);

  return [...paths.values()];
}

describe(tagMetadata, () => {
  it("gives every node the tag maps can produce a note", () => {
    const without = generatedPaths()
      .filter((path) => tagMetadata(path).note === null)
      .map((path) => path.join(" / "));

    expect(without).toStrictEqual([]);
  });

  it("gives every node the tag maps can produce an icon lucide has", () => {
    const names: readonly string[] = iconNames;
    const without = generatedPaths()
      .filter((path) => !names.includes(tagMetadata(path).icon ?? ""))
      .map((path) => path.join(" / "));

    expect(without).toStrictEqual([]);
  });

  it("gives a leaf the icon its name calls for over its family's", () => {
    expect(tagMetadata(["Body", "Luminary", "Sun"]).icon).toBe("sun");
    expect(tagMetadata(["Zodiac", "Dignity", "Domicile"]).icon).toBe("house");
    expect(
      tagMetadata(["Planetary", "Phase", "Venusian", "Morning Rise"]).icon,
    ).toBe("sunrise");
  });

  it("gives the Planet node its classes' planets beneath it", () => {
    expect(tagMetadata(["Body", "Planet"]).icon).toBe("earth");
    expect(tagMetadata(["Body", "Planet", "Personal", "Venus"])).toStrictEqual({
      icon: "user",
      note: expect.any(String) as string,
    });
  });

  it("gives the icon and note of a node with an entry", () => {
    expect(tagMetadata(["Body", "Luminary"])).toStrictEqual({
      icon: "sun-moon",
      note: "The Sun and the Moon.",
    });
  });

  it("gives a leaf the note of its family and the icon of its family", () => {
    expect(tagMetadata(["Aspect", "Simple", "Major", "Square"])).toStrictEqual({
      icon: "star",
      note: "Bodies 90° apart: friction that pushes toward action.",
    });
  });
});
