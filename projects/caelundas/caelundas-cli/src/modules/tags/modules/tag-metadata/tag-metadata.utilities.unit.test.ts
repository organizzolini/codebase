import { iconNames } from "lucide-react/dynamic";
import { describe, expect, it } from "vitest";

import { DURATION_UNITS } from "../../tag-dimensions.constants";
import { CONTEXT_TAG_MAPS, SHARED_TAG_MAP } from "../../tag-map.constants";

import { TAG_MENU_EXCLUSIONS } from "./tag-metadata-flags.constants";
import { TAG_EXTRA_PARENTS } from "./tag-metadata-parents.constants";
import { tagMenuFlags, tagMetadata } from "./tag-metadata.utilities";

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

  for (const kind of ["Decan Stay", "Full Sign", "Half Stay"]) {
    add(["Sign", "Stay", kind]);
  }

  for (const dignity of [
    "Detriment",
    "Domicile",
    "Exaltation",
    "Fall",
    "Peregrine",
  ]) {
    add(["Sign", "Dignity", dignity]);
  }

  for (const type of ["Annular", "Partial", "Total"]) {
    add(["Eclipse", "Solar", type]);
  }

  for (const type of ["Partial", "Total"]) {
    add(["Eclipse", "Lunar", type]);
  }

  for (const [unit] of DURATION_UNITS) {
    add(["Temporality", "Progressive", unit]);
  }

  add(["Temporality", "Perfective"]);
  add(["Temporality", "Progressive"]);

  return [...paths.values()];
}

describe("tag metadata", () => {
  describe(tagMenuFlags, () => {
    it("offers a tag in every menu unless it is excluded", () => {
      expect(tagMenuFlags(["Sign", "Aries"])).toStrictEqual({
        isDefaultGroup: true,
        isFilterable: true,
        isGroupable: true,
        isSelectable: true,
        isSortable: true,
      });
    });

    it("keeps a header over one dimension's values out of the Filter menu only", () => {
      expect(tagMenuFlags(["Sign", "Element"])).toStrictEqual({
        isDefaultGroup: true,
        isFilterable: false,
        isGroupable: true,
        isSelectable: true,
        isSortable: true,
      });
    });

    it("keeps a label over one dimension's spans or sides out of the Filter menu", () => {
      for (const path of [
        ["Yearly", "Annual Cycle", "Interval"],
        ["Sign", "Peak"],
      ]) {
        expect(tagMenuFlags(path).isFilterable).toBe(false);
      }

      expect(
        tagMenuFlags(["Yearly", "Annual Cycle", "Interval", "Beltane Pre"])
          .isFilterable,
      ).toBe(true);
    });

    it("keeps Dignity and its values out of the Filter menu, as a dignity belongs to a planet and a sign together", () => {
      const offered = [
        "",
        "Detriment",
        "Domicile",
        "Exaltation",
        "Fall",
        "Peregrine",
      ]
        .map((name) => ["Sign", "Dignity", name].filter(Boolean))
        .filter((path) => tagMenuFlags(path).isFilterable);

      expect(offered).toStrictEqual([]);
    });

    it("leaves the attribute roots out of the default grouping, and nothing else", () => {
      expect(
        ["Body", "Temporality", "Sign", "Aspect", "Yearly"].filter(
          (root) => !tagMenuFlags([root]).isDefaultGroup,
        ),
      ).toStrictEqual(["Body", "Temporality"]);
      expect(tagMenuFlags(["Body", "Planet"]).isDefaultGroup).toBe(true);
    });

    it("keeps Benefic out of the Sort and Select menus but in the Filter and Group menus", () => {
      expect(tagMenuFlags(["Body", "Planet", "Benefic"])).toStrictEqual({
        isDefaultGroup: true,
        isFilterable: true,
        isGroupable: true,
        isSelectable: false,
        isSortable: false,
      });
    });

    it("keeps every tag a preset or view filters by in the Filter menu", () => {
      const named = [
        ["Aspect", "Simple"],
        ["Aspect", "Simple", "Major"],
        ["Daily", "Daily Lunar"],
        ["Daily", "Daily Solar"],
        ["Daily", "Twilight"],
        ["Eclipse", "Lunar"],
        ["Eclipse", "Solar"],
        ["Lunar", "Apsides"],
        ["Lunar", "Monthly Cycle"],
        ["Planetary", "Direction"],
        ["Planetary", "Phase"],
        ["Planetary", "Synodic Stage"],
        ["Yearly", "Annual Cycle"],
        ["Sign", "Stay", "Decan Stay"],
        ["Sign", "Stay", "Full Sign"],
        ["Sign", "Stay", "Half Stay"],
        ["Sign", "Aries"],
      ].filter((path) => !tagMenuFlags(path).isFilterable);

      expect(named).toStrictEqual([]);
    });

    it("excludes only paths the tag maps can produce", () => {
      const known = new Set(
        [...generatedPaths(), ...Object.values(TAG_EXTRA_PARENTS).flat()].map(
          (path) => path.join(" / "),
        ),
      );
      const unknown = Object.values(TAG_MENU_EXCLUSIONS)
        .flat()
        .filter((path) => !known.has(path));

      expect(unknown).toStrictEqual([]);
    });
  });

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
      expect(tagMetadata(["Sign", "Dignity", "Domicile"]).icon).toBe("house");
      expect(
        tagMetadata(["Planetary", "Phase", "Venusian", "Morning Rise"]).icon,
      ).toBe("sunrise");
    });

    it("gives an empty path no icon and no note", () => {
      expect(tagMetadata([])).toStrictEqual({ icon: null, note: null });
    });

    it("gives the Planet node its classes' planets beneath it", () => {
      expect(tagMetadata(["Body", "Planet"]).icon).toBe("earth");
      expect(
        tagMetadata(["Body", "Planet", "Inner", "Personal", "Venus"]),
      ).toStrictEqual({
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
      expect(
        tagMetadata(["Aspect", "Simple", "Major", "Square"]),
      ).toStrictEqual({
        icon: "star",
        note: "Bodies 90° apart: friction that pushes toward action.",
      });
    });
  });
});
