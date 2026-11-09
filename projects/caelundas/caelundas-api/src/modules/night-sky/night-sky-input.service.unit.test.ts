import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { NightSkyColorsService } from "./night-sky-colors.service";
import { NightSkyInputService } from "./night-sky-input.service";

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

describe(NightSkyInputService, () => {
  let service: NightSkyInputService;

  const providers = [NightSkyColorsService];

  beforeAll(async () => {
    const built = await buildTestingModule(NightSkyInputService, { providers });

    service = built.instance;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(NightSkyInputService, {
      providers,
    });

    expect(instance).toBeInstanceOf(NightSkyInputService);
  });

  describe("parse", () => {
    it("fills the observer, the view and the figures with their defaults", () => {
      expect.hasAssertions();

      const parsed = service.parse({ height: 600, width: 800 });

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
        service.parse({ height: 600, width: 800 }).time.getTime(),
      ).toBeGreaterThanOrEqual(before);
      expect(
        service.parse({ height: 600, time: given, width: 800 }).time,
      ).toStrictEqual(given);
    });

    it("reads colors with or without the #, as lowercase #rrggbb", () => {
      expect.hasAssertions();

      expect(
        service.parse({
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
        service.parse({
          constellations: ["Ursa Major", " corona-borealis ", ""],
          height: 600,
          width: 800,
        }).constellations,
      ).toStrictEqual(["ursa_major", "corona_borealis"]);
    });

    it("reads none as no figure at all", () => {
      expect.hasAssertions();

      expect(
        service.parse({
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

      expect(() => service.parse(input)).toThrow(field);
    });
  });

  describe("snap", () => {
    it("snaps the time to the minute and the size up to its bucket", () => {
      expect.hasAssertions();

      const snapped = service.snap(
        service.parse({
          height: 690,
          time: new Date("2026-03-20T04:30:58.500Z"),
          width: 1090,
        }),
      );

      expect(snapped.time).toStrictEqual(new Date("2026-03-20T04:30:00Z"));
      expect(snapped).toMatchObject({ height: 704, width: 1152 });
    });

    it("keeps a size already on a bucket", () => {
      expect.hasAssertions();

      expect(
        service.snap(service.parse({ height: 640, width: 64 })),
      ).toMatchObject({ height: 640, width: 64 });
    });

    it("names each figure once, in order", () => {
      expect.hasAssertions();

      expect(
        service.snap(
          service.parse({
            constellations: ["zodiac", "Ursa Major", "zodiac", "aries"],
            height: 600,
            width: 800,
          }),
        ).constellations,
      ).toStrictEqual(["aries", "ursa_major", "zodiac"]);
    });
  });

  describe("toSlug", () => {
    it("lower-cases and joins words with underscores", () => {
      expect.hasAssertions();

      expect(service.toSlug(" Corona  Borealis ")).toBe("corona_borealis");
      expect(service.toSlug("Ursa-Minor")).toBe("ursa_minor");
    });
  });

  describe("selectConstellationSegments", () => {
    const segments = [URSA_MAJOR, SCORPIUS];

    it("selects every figure, the zodiac's, or the ones named", () => {
      expect.hasAssertions();

      expect(
        service.selectConstellationSegments(segments, ["all"]),
      ).toStrictEqual(segments);
      expect(
        service.selectConstellationSegments(segments, ["zodiac"]),
      ).toStrictEqual([SCORPIUS]);
      expect(
        service.selectConstellationSegments(segments, ["zodiac", "ursa_major"]),
      ).toStrictEqual(segments);
      expect(service.selectConstellationSegments(segments, [])).toStrictEqual(
        [],
      );
    });
  });
});
