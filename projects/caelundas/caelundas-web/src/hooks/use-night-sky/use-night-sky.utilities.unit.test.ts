import { describe, expect, it } from "vitest";

import {
  findUnknownConstellationNames,
  normalizeConstellationName,
  readNightSkyOverrides,
  selectConstellationSegments,
} from "./use-night-sky.utilities";

import type { ConstellationSegment } from "./night-sky.types";

const URSA_MAJOR: ConstellationSegment = {
  from: [11.0621, 61.751],
  name: "Ursa Major",
  to: [11.0307, 56.382],
  zodiac: false,
};

const SCORPIUS: ConstellationSegment = {
  from: [16.4901, -26.432],
  name: "Scorpius",
  to: [16.0056, -22.622],
  zodiac: true,
};

describe("use-night-sky utilities", () => {
  describe(readNightSkyOverrides, () => {
    it("reads the background colors with or without the #, as lowercase #rrggbb", () => {
      expect(
        readNightSkyOverrides({ "sky.bottom": "#ABC", "sky.top": "112233" }),
      ).toMatchObject({
        backgroundBottomColor: "#aabbcc",
        backgroundTopColor: "#112233",
      });
    });

    it("reads an all-digit color written with the #", () => {
      expect(readNightSkyOverrides({ "sky.top": "#123456" })).toMatchObject({
        backgroundTopColor: "#123456",
      });
    });

    it("falls back for a number, which the router makes of 1e5 and cannot give back", () => {
      for (const value of [123_456, 1e5, 100, 0]) {
        expect(readNightSkyOverrides({ "sky.top": value })).toMatchObject({
          backgroundTopColor: "#04060f",
        });
      }
    });

    it("falls back to the default colors for anything that is not hexadecimal", () => {
      for (const value of [
        "red",
        "12345",
        "#12345g",
        'red"/><script>',
        "#fff;x",
        "",
        true,
        null,
        [1],
      ]) {
        expect(
          readNightSkyOverrides({ "sky.bottom": value, "sky.top": value }),
        ).toMatchObject({
          backgroundBottomColor: "#0d1533",
          backgroundTopColor: "#04060f",
        });
      }
    });

    it("reads sky.constellations as normalized names, and only from text", () => {
      expect(
        readNightSkyOverrides({
          "sky.constellations": "Zodiac, Ursa Major,canis-major,,",
        }).constellations,
      ).toStrictEqual(["zodiac", "ursa_major", "canis_major"]);
      expect(
        readNightSkyOverrides({ "sky.constellations": 5 }).constellations,
      ).toStrictEqual([]);
      expect(readNightSkyOverrides({}).constellations).toStrictEqual([]);
    });
  });

  describe(normalizeConstellationName, () => {
    it("lower-cases and joins words with underscores", () => {
      expect(normalizeConstellationName(" Corona  Borealis ")).toBe(
        "corona_borealis",
      );
      expect(normalizeConstellationName("Ursa-Minor")).toBe("ursa_minor");
    });
  });

  describe(selectConstellationSegments, () => {
    const segments = [URSA_MAJOR, SCORPIUS];

    it("selects every figure, the zodiac's, or the ones named", () => {
      expect(selectConstellationSegments(segments, ["all"])).toStrictEqual(
        segments,
      );
      expect(selectConstellationSegments(segments, ["zodiac"])).toStrictEqual([
        SCORPIUS,
      ]);
      expect(
        selectConstellationSegments(segments, ["zodiac", "ursa_major"]),
      ).toStrictEqual(segments);
      expect(selectConstellationSegments(segments, [])).toStrictEqual([]);
    });
  });

  describe(findUnknownConstellationNames, () => {
    it("names what is neither a word it knows nor a constellation", () => {
      expect(
        findUnknownConstellationNames(
          [URSA_MAJOR],
          ["all", "zodiac", "ursa_major", "narnia"],
        ),
      ).toStrictEqual(["narnia"]);
    });
  });
});
