import { describe, expect, it } from "vitest";

import {
  describeNightSkyProblems,
  findUnknownConstellationNames,
  isFieldOfViewCut,
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
      ).toStrictEqual(["zodiac"]);
    });

    it("draws the zodiac's figures by default, every one or none when asked", () => {
      expect(readNightSkyOverrides({}).constellations).toStrictEqual([
        "zodiac",
      ]);
      expect(
        readNightSkyOverrides({ "sky.constellations": "all" }).constellations,
      ).toStrictEqual(["all"]);
      expect(
        readNightSkyOverrides({ "sky.constellations": "" }).constellations,
      ).toStrictEqual([]);
      expect(
        readNightSkyOverrides({ "sky.constellations": "none" }).constellations,
      ).toStrictEqual([]);
      expect(
        readNightSkyOverrides({ "sky.constellations": "zodiac,none" })
          .constellations,
      ).toStrictEqual([]);
    });
  });

  describe("the figures' line style", () => {
    it("defaults to faint, thin, pale blue lines", () => {
      expect(readNightSkyOverrides({})).toMatchObject({
        lineColor: "#ffffff",
        lineOpacity: 0.24,
        lineWidth: 0.8,
        rejectedKeys: [],
      });
    });

    it("reads the color like the background's, with or without the #", () => {
      expect(readNightSkyOverrides({ "sky.lineColor": "#F80" })).toMatchObject({
        lineColor: "#ff8800",
        rejectedKeys: [],
      });
      expect(
        readNightSkyOverrides({ "sky.lineColor": "102040" }).lineColor,
      ).toBe("#102040");
    });

    it("clamps an opacity or a width out of range", () => {
      expect(
        readNightSkyOverrides({ "sky.lineOpacity": 3, "sky.lineWidth": 50 }),
      ).toMatchObject({ lineOpacity: 1, lineWidth: 10, rejectedKeys: [] });
      expect(
        readNightSkyOverrides({ "sky.lineOpacity": -1, "sky.lineWidth": -2 }),
      ).toMatchObject({ lineOpacity: 0, lineWidth: 0, rejectedKeys: [] });
    });

    it("falls back to the default for a value it cannot read, and names its key", () => {
      expect(
        readNightSkyOverrides({
          "sky.lineColor": 123_456,
          "sky.lineOpacity": "half",
          "sky.lineWidth": "thick",
        }),
      ).toMatchObject({
        lineColor: "#ffffff",
        lineOpacity: 0.24,
        lineWidth: 0.8,
        rejectedKeys: ["sky.lineColor", "sky.lineOpacity", "sky.lineWidth"],
      });
    });
  });

  describe("the ecliptic", () => {
    it("is on by default, in a faint white dashed default style", () => {
      expect(readNightSkyOverrides({})).toMatchObject({
        ecliptic: true,
        eclipticColor: "#ffffff",
        eclipticOpacity: 0.12,
        eclipticWidth: 1,
      });
    });

    it("turns off for sky.ecliptic=false, and reads and clamps its style", () => {
      expect(
        readNightSkyOverrides({
          "sky.ecliptic": false,
          "sky.eclipticColor": "#abc",
          "sky.eclipticOpacity": 2,
          "sky.eclipticWidth": -1,
        }),
      ).toMatchObject({
        ecliptic: false,
        eclipticColor: "#aabbcc",
        eclipticOpacity: 1,
        eclipticWidth: 0,
        rejectedKeys: [],
      });
    });

    it("falls back for a style it cannot read, and names its key", () => {
      expect(
        readNightSkyOverrides({
          "sky.ecliptic": "yes",
          "sky.eclipticColor": "orange",
          "sky.lineWidth": "thick",
        }),
      ).toMatchObject({
        ecliptic: true,
        eclipticColor: "#ffffff",
        rejectedKeys: ["sky.lineWidth", "sky.eclipticColor"],
      });
    });
  });

  describe(describeNightSkyProblems, () => {
    it("names each line style key it ignored, then each unknown constellation", () => {
      expect(
        describeNightSkyProblems(["sky.lineWidth"], ["narnia"]),
      ).toStrictEqual([
        "The night sky ignored sky.lineWidth, whose value does not parse",
        "The night sky has no constellation named narnia",
      ]);
    });

    it("names nothing when nothing was ignored", () => {
      expect(describeNightSkyProblems([], [])).toStrictEqual([]);
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

  describe(isFieldOfViewCut, () => {
    it("says a cut only when it is more than the pole's own degree", () => {
      const measurements = {
        fieldOfViewClamped: true,
        fieldOfViewLimitDegrees: 89,
      };

      expect(isFieldOfViewCut(measurements, 90)).toBe(false);
      expect(isFieldOfViewCut(measurements, 91)).toBe(true);
      expect(
        isFieldOfViewCut({ ...measurements, fieldOfViewClamped: false }, 120),
      ).toBe(false);
    });
  });
});
