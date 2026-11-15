/* cspell:words Mynors mynors stanbul İstanbul */

import { describe, expect, it } from "vitest";

import { LIBRARY_DEFAULT_PAGE_SIZE } from "./library.constants";
import {
  escapeLikePattern,
  findMatchRanges,
  matchRangesOf,
  parseLibraryArguments,
} from "./library.utilities";

describe("library utilities", () => {
  describe(parseLibraryArguments, () => {
    it("applies the page and page size defaults and treats blank search as none", () => {
      expect.hasAssertions();

      expect(parseLibraryArguments({ search: "   " })).toStrictEqual({
        page: 1,
        pageSize: LIBRARY_DEFAULT_PAGE_SIZE,
        search: null,
      });
    });

    it("trims the search and keeps the page and page size it was given", () => {
      expect.hasAssertions();

      expect(
        parseLibraryArguments({ page: 3, pageSize: 10, search: "  vergil " }),
      ).toStrictEqual({ page: 3, pageSize: 10, search: "vergil" });
    });

    it("rejects a page below one", () => {
      expect.hasAssertions();

      expect(() => parseLibraryArguments({ page: 0 })).toThrow("Too small");
    });

    it("rejects a page size above the limit", () => {
      expect.hasAssertions();

      expect(() => parseLibraryArguments({ pageSize: 101 })).toThrow("Too big");
    });
  });

  describe(escapeLikePattern, () => {
    it("escapes LIKE wildcards and the escape character itself", () => {
      expect.hasAssertions();

      expect(escapeLikePattern(String.raw`50% of_a\b`)).toBe(
        String.raw`50\% of\_a\\b`,
      );
    });
  });

  describe(findMatchRanges, () => {
    it("finds every non-overlapping occurrence, case-insensitively", () => {
      expect.hasAssertions();

      expect(findMatchRanges("title", "Ana Ana", "ana")).toStrictEqual([
        { end: 3, field: "title", start: 0 },
        { end: 7, field: "title", start: 4 },
      ]);
    });

    it("indexes the original value where lowercasing changes its length", () => {
      expect.hasAssertions();

      expect(findMatchRanges("title", "İstanbul", "stanbul")).toStrictEqual([
        { end: 8, field: "title", start: 1 },
      ]);
    });

    it("reads regular-expression characters in a term literally", () => {
      expect.hasAssertions();

      expect(findMatchRanges("title", "a.b axb", "a.b")).toStrictEqual([
        { end: 3, field: "title", start: 0 },
      ]);
    });

    it("returns nothing without a term or a value", () => {
      expect.hasAssertions();

      expect(findMatchRanges("title", "Aeneid", null)).toStrictEqual([]);
      expect(findMatchRanges("title", null, "aeneid")).toStrictEqual([]);
    });
  });

  describe(matchRangesOf, () => {
    it("collects the ranges of every field in field order", () => {
      expect.hasAssertions();

      expect(
        matchRangesOf({ editors: "Mynors", title: "Mynors" }, "mynors"),
      ).toStrictEqual([
        { end: 6, field: "editors", start: 0 },
        { end: 6, field: "title", start: 0 },
      ]);
    });
  });
});
