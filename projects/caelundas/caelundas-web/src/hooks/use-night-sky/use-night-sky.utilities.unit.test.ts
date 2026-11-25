import { describe, expect, it } from "vitest";

import {
  describeNightSkyProblems,
  findUnknownConstellationNames,
  isFieldOfViewCut,
  normalizeConstellationName,
  readNightSkyOverrides,
  toNightSkyDrawing,
  toNightSkyInput,
} from "./use-night-sky.utilities";

describe("use-night-sky utilities", () => {
  describe(readNightSkyOverrides, () => {
    it("reads the background colors with or without the #, as lowercase #rrggbb", () => {
      expect(
        readNightSkyOverrides({
          "skyfield.bottom": "#ABC",
          "skyfield.top": "112233",
        }),
      ).toMatchObject({
        backgroundBottomColor: "#aabbcc",
        backgroundTopColor: "#112233",
      });
    });

    it("reads an all-digit color written with the #", () => {
      expect(
        readNightSkyOverrides({ "skyfield.top": "#123456" }),
      ).toMatchObject({
        backgroundTopColor: "#123456",
      });
    });

    it("falls back for a number, which the router makes of 1e5 and cannot give back", () => {
      for (const value of [123_456, 1e5, 100, 0]) {
        expect(readNightSkyOverrides({ "skyfield.top": value })).toMatchObject({
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
          readNightSkyOverrides({
            "skyfield.bottom": value,
            "skyfield.top": value,
          }),
        ).toMatchObject({
          backgroundBottomColor: "#0d1533",
          backgroundTopColor: "#04060f",
        });
      }
    });

    it("reads skyfield.constellations as normalized names, and only from text", () => {
      expect(
        readNightSkyOverrides({
          "skyfield.constellations": "Zodiac, Ursa Major,canis-major,,",
        }).constellations,
      ).toStrictEqual(["zodiac", "ursa_major", "canis_major"]);
      expect(
        readNightSkyOverrides({ "skyfield.constellations": 5 }).constellations,
      ).toStrictEqual(["all"]);
    });

    it("draws every figure by default, the zodiac or none when asked", () => {
      expect(readNightSkyOverrides({}).constellations).toStrictEqual(["all"]);
      expect(
        readNightSkyOverrides({ "skyfield.constellations": "zodiac" })
          .constellations,
      ).toStrictEqual(["zodiac"]);
      expect(
        readNightSkyOverrides({ "skyfield.constellations": "" }).constellations,
      ).toStrictEqual([]);
      expect(
        readNightSkyOverrides({ "skyfield.constellations": "none" })
          .constellations,
      ).toStrictEqual([]);
      expect(
        readNightSkyOverrides({ "skyfield.constellations": "zodiac,none" })
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
      expect(
        readNightSkyOverrides({ "skyfield.lineColor": "#F80" }),
      ).toMatchObject({
        lineColor: "#ff8800",
        rejectedKeys: [],
      });
      expect(
        readNightSkyOverrides({ "skyfield.lineColor": "102040" }).lineColor,
      ).toBe("#102040");
    });

    it("clamps an opacity or a width out of range", () => {
      expect(
        readNightSkyOverrides({
          "skyfield.lineOpacity": 3,
          "skyfield.lineWidth": 50,
        }),
      ).toMatchObject({ lineOpacity: 1, lineWidth: 10, rejectedKeys: [] });
      expect(
        readNightSkyOverrides({
          "skyfield.lineOpacity": -1,
          "skyfield.lineWidth": -2,
        }),
      ).toMatchObject({ lineOpacity: 0, lineWidth: 0, rejectedKeys: [] });
    });

    it("falls back to the default for a value it cannot read, and names its key", () => {
      expect(
        readNightSkyOverrides({
          "skyfield.lineColor": 123_456,
          "skyfield.lineOpacity": "half",
          "skyfield.lineWidth": "thick",
        }),
      ).toMatchObject({
        lineColor: "#ffffff",
        lineOpacity: 0.24,
        lineWidth: 0.8,
        rejectedKeys: [
          "skyfield.lineColor",
          "skyfield.lineOpacity",
          "skyfield.lineWidth",
        ],
      });
    });
  });

  describe("the opacities", () => {
    it("draws the sky faintly by default", () => {
      expect(readNightSkyOverrides({})).toMatchObject({ skyOpacity: 0.25 });
    });

    it("reads skyfield.opacity, clamped to 0 and 1", () => {
      expect(readNightSkyOverrides({ "skyfield.opacity": 0.3 })).toMatchObject({
        skyOpacity: 0.3,
      });
      expect(readNightSkyOverrides({ "skyfield.opacity": 3 })).toMatchObject({
        skyOpacity: 1,
      });
    });

    it("falls back to the default for a value it cannot read", () => {
      expect(
        readNightSkyOverrides({ "skyfield.opacity": "dim" }),
      ).toMatchObject({
        skyOpacity: 0.25,
      });
    });

    it("ignores the calendar opacity an old link carries", () => {
      expect(
        readNightSkyOverrides({ "skyfield.surfaceOpacity": 0.2 }),
      ).not.toHaveProperty("surfaceOpacity");
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

    it("turns off for skyfield.ecliptic=false, and reads and clamps its style", () => {
      expect(
        readNightSkyOverrides({
          "skyfield.ecliptic": false,
          "skyfield.eclipticColor": "#abc",
          "skyfield.eclipticOpacity": 2,
          "skyfield.eclipticWidth": -1,
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
          "skyfield.ecliptic": "yes",
          "skyfield.eclipticColor": "orange",
          "skyfield.lineWidth": "thick",
        }),
      ).toMatchObject({
        ecliptic: true,
        eclipticColor: "#ffffff",
        rejectedKeys: ["skyfield.lineWidth", "skyfield.eclipticColor"],
      });
    });
  });

  describe(describeNightSkyProblems, () => {
    it("names each line style key it ignored, then each unknown constellation", () => {
      expect(
        describeNightSkyProblems(["skyfield.lineWidth"], ["narnia"]),
      ).toStrictEqual([
        "The night sky ignored skyfield.lineWidth, whose value does not parse",
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

  describe(findUnknownConstellationNames, () => {
    it("names what is neither a word it knows nor a constellation", () => {
      expect(
        findUnknownConstellationNames([
          "all",
          "none",
          "zodiac",
          "ursa_major",
          "corona_borealis",
          "narnia",
        ]),
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

  describe(toNightSkyDrawing, () => {
    it("leaves out the opacities the page applies", () => {
      const drawing = toNightSkyDrawing(readNightSkyOverrides({}));

      expect(drawing).not.toHaveProperty("skyOpacity");
      expect(drawing).toMatchObject({ latitudeDegrees: 90 });
    });
  });

  describe(toNightSkyInput, () => {
    const view = { size: { height: 600.4, width: 800 }, still: false };

    it("writes every setting of the backdrop, the window it fills and the pose", () => {
      expect(toNightSkyInput(readNightSkyOverrides({}), view)).toStrictEqual({
        backgroundBottomColor: "#0d1533",
        backgroundTopColor: "#04060f",
        bottomAltitudeDegrees: 0,
        constellations: ["all"],
        debug: false,
        ecliptic: true,
        eclipticColor: "#ffffff",
        eclipticOpacity: 0.12,
        eclipticWidth: 1,
        faintestMagnitude: 6.5,
        height: 600,
        latitudeDegrees: 90,
        lineColor: "#ffffff",
        lineOpacity: 0.24,
        lineWidth: 0.8,
        longitudeDegrees: -74,
        pixelsPerSecond: 3,
        starScale: 1,
        still: false,
        verticalFieldOfViewDegrees: 90,
        width: 800,
      });
    });

    it("writes the link's values, and no figure as none", () => {
      expect(
        toNightSkyInput(
          readNightSkyOverrides({
            "skyfield.constellations": "",
            "skyfield.debug": true,
            "skyfield.lat": 51.5,
            "skyfield.maxMag": 4,
          }),
          { ...view, still: true },
        ),
      ).toMatchObject({
        constellations: ["none"],
        debug: true,
        faintestMagnitude: 4,
        latitudeDegrees: 51.5,
        still: true,
      });
      expect(
        toNightSkyInput(
          readNightSkyOverrides({
            "skyfield.constellations": "ursa_major,leo",
          }),
          view,
        ).constellations,
      ).toStrictEqual(["ursa_major", "leo"]);
    });
  });
});
