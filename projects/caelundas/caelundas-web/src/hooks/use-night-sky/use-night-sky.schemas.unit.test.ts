import { describe, expect, it } from "vitest";

import { segmentRecordSchema, starRecordSchema } from "./use-night-sky.schemas";

describe("night sky schemas", () => {
  describe("starRecordSchema", () => {
    it("reads a star row as the generator's catalog row", () => {
      expect(
        starRecordSchema.parse({
          color_index: 0.01,
          declination_degrees: -16.716,
          magnitude: -1.4,
          right_ascension_hours: 6.7525,
        }),
      ).toStrictEqual([6.7525, -16.716, -1.4, 0.01]);
    });

    it("rejects a row with a missing field or one out of range", () => {
      expect(
        starRecordSchema.safeParse({
          declination_degrees: 1,
          magnitude: 1,
          right_ascension_hours: 1,
        }).success,
      ).toBe(false);
      expect(
        starRecordSchema.safeParse({
          color_index: 0,
          declination_degrees: 1,
          magnitude: 1,
          right_ascension_hours: 25,
        }).success,
      ).toBe(false);
    });
  });

  describe("segmentRecordSchema", () => {
    it("reads a segment with SQLite's 0 or 1 for its zodiac flag", () => {
      expect(
        segmentRecordSchema.parse({
          from_declination_degrees: 61.751,
          from_right_ascension_hours: 11.0621,
          name: "Ursa Major",
          to_declination_degrees: 56.382,
          to_right_ascension_hours: 11.0307,
          zodiac: 0,
        }),
      ).toStrictEqual({
        from: [11.0621, 61.751],
        name: "Ursa Major",
        to: [11.0307, 56.382],
        zodiac: false,
      });
    });
  });
});
