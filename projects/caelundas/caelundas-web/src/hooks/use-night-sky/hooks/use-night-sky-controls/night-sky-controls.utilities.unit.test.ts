import { describe, expect, it } from "vitest";

import {
  listShownFigures,
  roundToStep,
  toConstellationsChange,
  toEclipticChange,
  toggleFigure,
  toResetChange,
  toSkyParameterChange,
  toVisibilityChange,
} from "./night-sky-controls.utilities";

import type { ConstellationListing } from "../../night-sky.types";

const LISTING: readonly ConstellationListing[] = [
  { name: "Aries", zodiac: true },
  { name: "Leo", zodiac: true },
  { name: "Orion", zodiac: false },
  { name: "Ursa Major", zodiac: false },
];

describe("night-sky-controls utilities", () => {
  describe(roundToStep, () => {
    it("rounds to the decimals of the step", () => {
      expect(roundToStep(0.1 * 3, 0.1)).toBe(0.3);
      expect(roundToStep(12.4, 1)).toBe(12);
    });
  });

  describe(toConstellationsChange, () => {
    it("removes all, the default, writes the zodiac and none, and joins the rest", () => {
      expect(toConstellationsChange(["all"])).toStrictEqual({
        "skyfield.constellations": undefined,
      });
      expect(toConstellationsChange(["zodiac"])).toStrictEqual({
        "skyfield.constellations": "zodiac",
      });
      expect(toConstellationsChange([])).toStrictEqual({
        "skyfield.constellations": "none",
      });
      expect(toConstellationsChange(["zodiac", "ursa_major"])).toStrictEqual({
        "skyfield.constellations": "zodiac,ursa_major",
      });
    });
  });

  describe(listShownFigures, () => {
    it("lists the names a choice of figures draws", () => {
      expect([...listShownFigures(["all"], LISTING)]).toHaveLength(4);
      expect([...listShownFigures(["zodiac"], LISTING)]).toStrictEqual([
        "Aries",
        "Leo",
      ]);
      expect([...listShownFigures(["ursa_major"], LISTING)]).toStrictEqual([
        "Ursa Major",
      ]);
      expect([...listShownFigures([], LISTING)]).toStrictEqual([]);
    });
  });

  describe(toggleFigure, () => {
    it("hides one figure of all, naming the zodiac when it is what is left whole", () => {
      expect(toggleFigure(["all"], LISTING, "Orion")).toStrictEqual([
        "zodiac",
        "ursa_major",
      ]);
    });

    it("hides a zodiac figure, naming each of the rest", () => {
      expect(toggleFigure(["all"], LISTING, "Leo")).toStrictEqual([
        "aries",
        "orion",
        "ursa_major",
      ]);
    });

    it("shows a hidden figure, saying all once every one shows", () => {
      expect(
        toggleFigure(["zodiac", "orion"], LISTING, "Ursa Major"),
      ).toStrictEqual(["all"]);
    });

    it("shows a figure among none", () => {
      expect(toggleFigure([], LISTING, "Orion")).toStrictEqual(["orion"]);
    });
  });

  describe(toEclipticChange, () => {
    it("removes the key to draw the ecliptic and writes false to hide it", () => {
      expect(toEclipticChange(true)).toStrictEqual({
        "skyfield.ecliptic": undefined,
      });
      expect(toEclipticChange(false)).toStrictEqual({
        "skyfield.ecliptic": false,
      });
    });
  });

  describe(toVisibilityChange, () => {
    it("removes sky to show the sky and writes off to hide it", () => {
      expect(toVisibilityChange(true)).toStrictEqual({ skyfield: undefined });
      expect(toVisibilityChange(false)).toStrictEqual({ skyfield: "off" });
    });
  });

  describe(toSkyParameterChange, () => {
    it("writes a setting, and removes it when it is set back to its default", () => {
      expect(toSkyParameterChange("skyfield.lat", 45)).toStrictEqual({
        "skyfield.lat": 45,
      });
      expect(toSkyParameterChange("skyfield.lat", 90)).toStrictEqual({
        "skyfield.lat": undefined,
      });
      expect(toSkyParameterChange("skyfield.top", "#04060F")).toStrictEqual({
        "skyfield.top": undefined,
      });
      expect(toSkyParameterChange("skyfield.top", "#ffffff")).toStrictEqual({
        "skyfield.top": "#ffffff",
      });
    });
  });

  describe(toResetChange, () => {
    it("removes every key the controls set", () => {
      const change = toResetChange();

      expect(Object.values(change).every((value) => value === undefined)).toBe(
        true,
      );
      expect(Object.keys(change)).toContain("skyfield.constellations");
      expect(Object.keys(change)).toContain("skyfield.lat");
    });
  });
});
