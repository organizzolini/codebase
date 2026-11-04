import { describe, expect, it } from "vitest";

import {
  listShownConstellations,
  readFolderState,
  roundToStep,
  splitConstellations,
  toConstellationsChange,
  toEclipticChange,
  toggleConstellation,
  toggleConstellations,
  toResetChange,
  toSkyParameterChange,
  toVisibilityChange,
} from "./night-sky-menu.utilities";

import type { ConstellationListing } from "../../hooks/use-night-sky/night-sky.types";

const LISTING: readonly ConstellationListing[] = [
  { name: "Aries", zodiac: true },
  { name: "Leo", zodiac: true },
  { name: "Orion", zodiac: false },
  { name: "Ursa Major", zodiac: false },
];

describe("night sky menu utilities", () => {
  describe(toSkyParameterChange, () => {
    it("writes a value that differs from its default", () => {
      expect(toSkyParameterChange("sky.lat", 51.5)).toStrictEqual({
        "sky.lat": 51.5,
      });
      expect(toSkyParameterChange("sky.top", "#102040")).toStrictEqual({
        "sky.top": "#102040",
      });
    });

    it("removes a value set back to its default, so the link stays short", () => {
      expect(toSkyParameterChange("sky.lat", 90)).toStrictEqual({
        "sky.lat": undefined,
      });
      expect(toSkyParameterChange("sky.top", "#04060F")).toStrictEqual({
        "sky.top": undefined,
      });
    });
  });

  describe(roundToStep, () => {
    it("rounds a slider's value to its step's decimals", () => {
      expect(roundToStep(0.1 * 3, 0.1)).toBe(0.3);
      expect(roundToStep(0.284_999, 0.01)).toBe(0.28);
      expect(roundToStep(12, 1)).toBe(12);
    });
  });

  describe(toVisibilityChange, () => {
    it("writes sky=off to hide the sky and removes it to show it", () => {
      expect(toVisibilityChange(false)).toStrictEqual({ sky: "off" });
      expect(toVisibilityChange(true)).toStrictEqual({ sky: undefined });
    });
  });

  describe(toResetChange, () => {
    it("removes every key the menu sets, and keeps the tuning view", () => {
      const change = toResetChange();

      expect(change).toMatchObject({
        sky: undefined,
        "sky.constellations": undefined,
        "sky.eclipticOpacity": undefined,
        "sky.lat": undefined,
        "sky.lineColor": undefined,
        "sky.top": undefined,
      });
      expect(change).not.toHaveProperty("sky.debug");
    });
  });

  describe(toConstellationsChange, () => {
    it("removes the zodiac, the default, writes all and none, and joins the rest", () => {
      expect(toConstellationsChange(["zodiac"])).toStrictEqual({
        "sky.constellations": undefined,
      });
      expect(toConstellationsChange(["all"])).toStrictEqual({
        "sky.constellations": "all",
      });
      expect(toConstellationsChange([])).toStrictEqual({
        "sky.constellations": "none",
      });
      expect(toConstellationsChange(["zodiac", "ursa_major"])).toStrictEqual({
        "sky.constellations": "zodiac,ursa_major",
      });
    });
  });

  describe(listShownConstellations, () => {
    it("lists the names a choice of figures shows", () => {
      expect(listShownConstellations(["zodiac"], LISTING)).toStrictEqual(
        new Set(["Aries", "Leo"]),
      );
      expect(listShownConstellations(["all"], LISTING)).toStrictEqual(
        new Set(["Aries", "Leo", "Orion", "Ursa Major"]),
      );
      expect(listShownConstellations(["ursa_major"], LISTING)).toStrictEqual(
        new Set(["Ursa Major"]),
      );
    });
  });

  describe(toggleConstellation, () => {
    it("adds a constellation to the zodiac", () => {
      expect(
        toggleConstellation(["zodiac"], LISTING, "Ursa Major"),
      ).toStrictEqual(["zodiac", "ursa_major"]);
    });

    it("takes one out of the zodiac by naming the rest", () => {
      expect(toggleConstellation(["zodiac"], LISTING, "Leo")).toStrictEqual([
        "aries",
      ]);
    });

    it("folds a full choice back into all, or into nothing", () => {
      expect(
        toggleConstellation(["zodiac", "ursa_major"], LISTING, "Orion"),
      ).toStrictEqual(["all"]);
      expect(
        toggleConstellation(["ursa_major"], LISTING, "Ursa Major"),
      ).toStrictEqual([]);
    });
  });

  describe(splitConstellations, () => {
    it("files the zodiac's apart from the others, each in name order", () => {
      expect(splitConstellations(LISTING)).toStrictEqual({
        other: [
          { name: "Orion", zodiac: false },
          { name: "Ursa Major", zodiac: false },
        ],
        zodiac: [
          { name: "Aries", zodiac: true },
          { name: "Leo", zodiac: true },
        ],
      });
    });
  });

  describe(readFolderState, () => {
    it("reads a folder as checked, partly checked, or unchecked", () => {
      const names = ["Aries", "Leo"];

      expect(readFolderState(new Set(names), names)).toBe("checked");
      expect(readFolderState(new Set(["Leo"]), names)).toBe("partial");
      expect(readFolderState(new Set(["Orion"]), names)).toBe("unchecked");
    });
  });

  describe(toggleConstellations, () => {
    it("checks every child of a folder that is not all checked", () => {
      expect(
        toggleConstellations(["aries"], LISTING, ["Aries", "Leo"]),
      ).toStrictEqual(["zodiac"]);
      expect(toggleConstellations([], LISTING, ["Aries", "Leo"])).toStrictEqual(
        ["zodiac"],
      );
    });

    it("unchecks every child of a folder that is all checked", () => {
      expect(
        toggleConstellations(["zodiac", "orion"], LISTING, ["Aries", "Leo"]),
      ).toStrictEqual(["orion"]);
    });
  });

  describe(toEclipticChange, () => {
    it("writes sky.ecliptic=false to hide it and removes it to draw it", () => {
      expect(toEclipticChange(false)).toStrictEqual({ "sky.ecliptic": false });
      expect(toEclipticChange(true)).toStrictEqual({
        "sky.ecliptic": undefined,
      });
    });
  });
});
