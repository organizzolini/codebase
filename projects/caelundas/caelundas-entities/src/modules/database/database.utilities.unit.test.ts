import moment from "moment-timezone";
import { describe, expect, it } from "vitest";

import { createMomentTransformer } from "./database.utilities";

describe("caelundas database utilities", () => {
  describe(createMomentTransformer, () => {
    const transformer = createMomentTransformer();

    it("writes a moment as the ISO 8601 UTC text of the instant it names", () => {
      const written: unknown = transformer.to(
        moment.tz("2026-07-01T06:00:00", "America/New_York"),
      );

      expect(written).toBe("2026-07-01T10:00:00.000Z");
    });

    it("writes a date as the same text", () => {
      expect(transformer.to(new Date("2026-07-01T10:00:00Z"))).toBe(
        "2026-07-01T10:00:00.000Z",
      );
    });

    it("reads text back as a moment in UTC", () => {
      const read: unknown = transformer.from("2026-07-01T10:00:00.000Z");

      expect(moment.isMoment(read)).toBe(true);
      expect(moment.isMoment(read) && read.toISOString(true)).toBe(
        "2026-07-01T10:00:00.000+00:00",
      );
    });

    it("reads a null or an undefined back unchanged", () => {
      expect(transformer.from(null)).toBeNull();
      expect(transformer.from(undefined)).toBeUndefined();
    });

    it("passes a null and an undefined through when writing", () => {
      expect(transformer.to(null)).toBeNull();
      expect(transformer.to(undefined)).toBeUndefined();
    });
  });
});
