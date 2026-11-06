import { describe, expect, it } from "vitest";

import {
  normalizeConstellationName,
  parseNightSkyInput,
  selectConstellationSegments,
} from "./night-sky-input.utilities";

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

describe("night sky input suite", () => {
  describe(parseNightSkyInput, () => {
    it("fills the observer, the view and the figures with their defaults", () => {
      expect.hasAssertions();

      const parsed = parseNightSkyInput({ height: 600, width: 800 });

      expect(parsed).toMatchObject({
        backgroundBottomColor: "#0d1533",
        bottomAltitudeDegrees: 0,
        constellations: ["zodiac"],
        latitudeDegrees: 90,
        longitudeDegrees: -74,
        verticalFieldOfViewDegrees: 90,
      });
    });

    it("defaults the time to now and keeps one it is given", () => {
      expect.hasAssertions();

      const before = Date.now();
      const given = new Date("2026-03-20T04:30:00Z");

      expect(
        parseNightSkyInput({ height: 600, width: 800 }).time.getTime(),
      ).toBeGreaterThanOrEqual(before);
      expect(
        parseNightSkyInput({ height: 600, time: given, width: 800 }).time,
      ).toStrictEqual(given);
    });

    it("reads colors with or without the #, as lowercase #rrggbb", () => {
      expect.hasAssertions();

      expect(
        parseNightSkyInput({
          backgroundTopColor: "ABC",
          height: 600,
          lineColor: "#FFAA00",
          width: 800,
        }),
      ).toMatchObject({ backgroundTopColor: "#aabbcc", lineColor: "#ffaa00" });
    });

    it("reads constellation names the way a link writes them", () => {
      expect.hasAssertions();

      expect(
        parseNightSkyInput({
          constellations: ["Ursa Major", " corona-borealis ", ""],
          height: 600,
          width: 800,
        }).constellations,
      ).toStrictEqual(["ursa_major", "corona_borealis"]);
    });

    it("reads none as no figure at all", () => {
      expect.hasAssertions();

      expect(
        parseNightSkyInput({
          constellations: ["zodiac", "none"],
          height: 600,
          width: 800,
        }).constellations,
      ).toStrictEqual([]);
    });

    it.each([
      [{ height: 600, width: 0 }, "width"],
      [{ height: 99_999, width: 800 }, "height"],
      [{ height: 600, latitudeDegrees: 0, width: 800 }, "latitudeDegrees"],
      [
        { backgroundTopColor: "red", height: 600, width: 800 },
        "backgroundTopColor",
      ],
      [{ height: 600, pixelsPerSecond: 0, width: 800 }, "pixelsPerSecond"],
    ])("rejects %j", (input, field) => {
      expect.hasAssertions();

      expect(() => parseNightSkyInput(input)).toThrow(field);
    });
  });

  describe(normalizeConstellationName, () => {
    it("lower-cases and joins words with underscores", () => {
      expect.hasAssertions();

      expect(normalizeConstellationName(" Corona  Borealis ")).toBe(
        "corona_borealis",
      );
      expect(normalizeConstellationName("Ursa-Minor")).toBe("ursa_minor");
    });
  });

  describe(selectConstellationSegments, () => {
    const segments = [URSA_MAJOR, SCORPIUS];

    it("selects every figure, the zodiac's, or the ones named", () => {
      expect.hasAssertions();

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
});
