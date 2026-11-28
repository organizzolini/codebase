import { describe, expect, it } from "vitest";

import {
  clampPages,
  getPageCount,
  getPageRange,
  toLoadedPages,
} from "./calendar-page-strip.utilities";

describe("calendar-page-strip utilities", () => {
  describe(getPageCount, () => {
    it("takes a page for each page size of the longest list, rounded up", () => {
      expect(getPageCount(100, 25)).toBe(4);
      expect(getPageCount(101, 25)).toBe(5);
      expect(getPageCount(1, 100)).toBe(1);
    });

    it("is at least one page, even for no events", () => {
      expect(getPageCount(0, 25)).toBe(1);
    });
  });

  describe(getPageRange, () => {
    it("covers a page size of events from where the page before ended", () => {
      expect(getPageRange(1, 25, 100)).toBe("1–25");
      expect(getPageRange(3, 25, 100)).toBe("51–75");
    });

    it("ends the last page where the list does", () => {
      expect(getPageRange(5, 25, 101)).toBe("101–101");
      expect(getPageRange(2, 50, 70)).toBe("51–70");
    });

    it("covers nothing past the first event of an empty list", () => {
      expect(getPageRange(1, 25, 0)).toBe("1–1");
    });
  });

  describe(toLoadedPages, () => {
    it("loads through a page that is checked", () => {
      expect(toLoadedPages(4, true)).toBe(4);
    });

    it("trims to the page before one that is unchecked", () => {
      expect(toLoadedPages(4, false)).toBe(3);
    });

    it("keeps the first page whatever is done to it", () => {
      expect(toLoadedPages(1, false)).toBe(1);
      expect(toLoadedPages(2, false)).toBe(1);
    });
  });

  describe(clampPages, () => {
    it("keeps the pages within the pages there are", () => {
      expect(clampPages(9, 4)).toBe(4);
      expect(clampPages(3, 4)).toBe(3);
      expect(clampPages(0, 4)).toBe(1);
    });
  });
});
