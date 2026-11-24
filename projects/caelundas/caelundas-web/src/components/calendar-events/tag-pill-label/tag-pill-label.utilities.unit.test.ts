import { describe, expect, it } from "vitest";

import {
  createTagIcons,
  getTagGlyph,
  getTagLead,
} from "./tag-pill-label.utilities";

describe("tag-pill-label utilities", () => {
  describe(createTagIcons, () => {
    it("maps each tag with an icon by its id, across the facets", () => {
      const icons = createTagIcons([
        {
          icon: "orbit",
          id: "body",
          name: "Body",
          values: [
            {
              count: 1,
              depth: 1,
              icon: "sun",
              id: "sun",
              name: "Sun",
              path: "Sun",
            },
            { count: 1, depth: 1, id: "venus", name: "Venus", path: "Venus" },
          ],
        },
      ]);

      expect([...icons]).toStrictEqual([["sun", "sun"]]);
    });
  });

  describe(getTagGlyph, () => {
    it("gives the symbol of a body, a sign, and an aspect", () => {
      expect(getTagGlyph("Venus")).toBe("♀");
      expect(getTagGlyph("Aries")).toBe("♈");
      expect(getTagGlyph("Conjunct")).toBe("☌");
    });

    it("reads the last name of a label that is a path", () => {
      expect(getTagGlyph("Planet / Venus")).toBe("♀");
    });

    it("gives nothing for a tag with no known symbol", () => {
      expect(getTagGlyph("Retrograde Period")).toBeUndefined();
    });
  });

  describe(getTagLead, () => {
    it("prefers the symbol of the name, even to an icon the tag has", () => {
      expect(getTagLead("heart", "Venus")).toStrictEqual({
        kind: "glyph",
        value: "♀",
      });
    });

    it("falls back to the tag's icon when the name has no symbol and lucide has the icon", () => {
      expect(getTagLead("moon", "Retrograde Period")).toStrictEqual({
        kind: "icon",
        value: "moon",
      });
    });

    it("falls back to the generic tag icon with no symbol and no icon lucide has", () => {
      expect(getTagLead(undefined, "Retrograde Period")).toStrictEqual({
        kind: "icon",
        value: "tag",
      });
      expect(getTagLead("not-an-icon", "Retrograde Period")).toStrictEqual({
        kind: "icon",
        value: "tag",
      });
    });

    it("has a symbol for each moon phase and for the apsides", () => {
      for (const name of [
        "New",
        "Waxing Crescent",
        "First Quarter",
        "Waxing Gibbous",
        "Full",
        "Waning Gibbous",
        "Last Quarter",
        "Waning Crescent",
        "Perigee",
        "Apogee",
      ]) {
        expect(getTagLead(undefined, name).kind).toBe("glyph");
      }
    });
  });
});
