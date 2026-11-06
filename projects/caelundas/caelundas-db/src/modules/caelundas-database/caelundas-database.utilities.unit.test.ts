import moment from "moment-timezone";
import { describe, expect, it } from "vitest";

import {
  createCoordinateTransformer,
  createMomentTransformer,
} from "./caelundas-database.utilities";

describe("caelundas database utilities", () => {
  describe(createCoordinateTransformer, () => {
    const transformer = createCoordinateTransformer();

    it("writes a number fixed to six decimals", () => {
      expect(transformer.to(40.7128)).toBe("40.712800");
    });

    it("writes a string as it was given", () => {
      expect(transformer.to("-70.000000")).toBe("-70.000000");
    });

    it("reads the text Postgres sends back unchanged", () => {
      expect(transformer.from("40.712800")).toBe("40.712800");
    });

    it("passes a null and an undefined through both ways", () => {
      expect(transformer.to(null)).toBeNull();
      expect(transformer.to(undefined)).toBeUndefined();
      expect(transformer.from(null)).toBeNull();
      expect(transformer.from(undefined)).toBeUndefined();
    });
  });

  describe(createMomentTransformer, () => {
    const transformer = createMomentTransformer();

    it("writes a moment as the date of the instant it names", () => {
      const written: unknown = transformer.to(
        moment.tz("2026-07-01T06:00:00", "America/New_York"),
      );

      expect(written).toStrictEqual(new Date("2026-07-01T10:00:00.000Z"));
    });

    it("writes a date as it was given", () => {
      const date = new Date("2026-07-01T10:00:00Z");

      expect(transformer.to(date)).toBe(date);
    });

    it("reads a date back as a moment in UTC", () => {
      const read: unknown = transformer.from(new Date("2026-07-01T10:00:00Z"));

      expect(moment.isMoment(read)).toBe(true);
      expect(moment.isMoment(read) && read.toISOString(true)).toBe(
        "2026-07-01T10:00:00.000+00:00",
      );
    });

    it("passes a null and an undefined through both ways", () => {
      expect(transformer.from(null)).toBeNull();
      expect(transformer.from(undefined)).toBeUndefined();
      expect(transformer.to(null)).toBeNull();
      expect(transformer.to(undefined)).toBeUndefined();
    });
  });
});
