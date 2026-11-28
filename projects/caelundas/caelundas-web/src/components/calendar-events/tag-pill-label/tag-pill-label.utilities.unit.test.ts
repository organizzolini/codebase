import { describe, expect, it } from "vitest";

import {
  createTagIcons,
  getTagGlyph,
  getTagLead,
} from "./tag-pill-label.utilities";

describe("tag-pill-label utilities", () => {
  describe(createTagIcons, () => {
    it("maps each root and each tag with an icon by its id, across the facets", () => {
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

      expect([...icons]).toStrictEqual([
        ["body", "orbit"],
        ["sun", "sun"],
      ]);
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

    it("gives a focal body the symbol of its body", () => {
      expect(getTagGlyph("Sun Focal")).toBe("☀️");
      expect(getTagGlyph("Aspect / Compound / Focal Body / Venus Focal")).toBe(
        "♀",
      );
    });

    it("gives the lunar nodes, the days of the Sun's year and the compound aspects their symbols", () => {
      expect(getTagGlyph("North Lunar Node")).toBe("☊");
      expect(getTagGlyph("South Lunar Node")).toBe("☋");
      expect(getTagGlyph("Vernal Equinox")).toBe("🌸");
      expect(getTagGlyph("Beltane")).toBe("🌼");
      expect(getTagGlyph("First Hexadecan")).toBe("🌳");
      expect(getTagGlyph("T Square")).toBe("⊤");
      expect(getTagGlyph("Grand Trine")).toBe("△");
      expect(getTagGlyph("Triple")).toBe("✨");
      expect(getTagGlyph("Stellium")).toBe("🎆");
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

    it("leads Unique with the fingerprint icon, to an icon the tag has", () => {
      expect(getTagLead("tag", "Unique")).toStrictEqual({
        kind: "icon",
        value: "fingerprint",
      });
      expect(getTagLead(undefined, "Harmonic / Unique")).toStrictEqual({
        kind: "icon",
        value: "fingerprint",
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
