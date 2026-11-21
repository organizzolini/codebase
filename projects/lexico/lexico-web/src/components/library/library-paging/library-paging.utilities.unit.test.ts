import { describe, expect, it } from "vitest";

import { formatRange, listPages } from "./library-paging.utilities";

describe("library paging utilities", () => {
  describe(listPages, () => {
    it("numbers every page from one", () => {
      expect(listPages(3)).toStrictEqual([1, 2, 3]);
    });

    it("offers the first page when there are none", () => {
      expect(listPages(0)).toStrictEqual([1]);
    });
  });

  describe(formatRange, () => {
    it("names the first and last row of a page out of the total", () => {
      expect(formatRange(1, 25, 500)).toBe("1 to 25 of 500");
      expect(formatRange(3, 25, 60)).toBe("51 to 60 of 60");
    });

    it("names the one row of a one-row library", () => {
      expect(formatRange(1, 25, 1)).toBe("1 of 1");
    });

    it("reads 0 of 0 when there are no authors", () => {
      expect(formatRange(1, 25, 0)).toBe("0 of 0");
    });

    it("stops at the total when the page is past the end", () => {
      expect(formatRange(9, 25, 60)).toBe("0 of 60");
    });
  });
});
