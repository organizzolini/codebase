import { describe, expect, it } from "vitest";

import { describeRange, toPosition } from "./gallery-pager.utilities";

describe("gallery pager utilities", () => {
  describe(describeRange, () => {
    it("words the range, and 0 of the total for an empty page", () => {
      expect(
        describeRange({ position: 0, shown: 24, size: 24, total: 182_397 }),
      ).toBe("1 to 24 of 182,397");
      expect(
        describeRange({ position: 7587, shown: 9, size: 24, total: 182_397 }),
      ).toBe("182,089 to 182,097 of 182,397");
      expect(describeRange({ position: 0, shown: 0, size: 24, total: 0 })).toBe(
        "0 of 0",
      );
    });
  });

  describe(toPosition, () => {
    it("reads a page typed from 1 as a place from 0", () => {
      expect(toPosition("1", 10)).toBe(0);
      expect(toPosition("10", 10)).toBe(9);
    });

    it("gives none for a number that is no page, or for nothing typed", () => {
      for (const typed of ["", " ", "0", "11", "1.5", "abc", "-2"]) {
        expect(toPosition(typed, 10)).toBeUndefined();
      }
    });
  });
});
