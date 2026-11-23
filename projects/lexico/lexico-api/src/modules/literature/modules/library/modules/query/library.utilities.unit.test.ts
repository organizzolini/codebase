/* cspell:words Mynors mynors stanbul İstanbul */

import { describe, expect, it } from "vitest";

import { LIBRARY_DEFAULT_PAGE_SIZE } from "../../library.constants";
import {
  LibraryGroupField,
  LibrarySortDirection,
  LibrarySortField,
} from "../sort/library-sort.entities";

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
        filters: {},
        page: 1,
        pageSize: LIBRARY_DEFAULT_PAGE_SIZE,
        search: null,
        sort: [{ direction: "ASC", field: "AUTHOR_NAME" }],
      });
    });

    it("keeps every sort in order, defaulting each direction and dropping a repeated attribute", () => {
      expect.hasAssertions();

      expect(
        parseLibraryArguments({
          sort: [
            {
              direction: LibrarySortDirection.DESC,
              field: LibrarySortField.AUTHOR_ERA,
            },
            { field: LibrarySortField.AUTHOR_START_YEAR },
            {
              direction: LibrarySortDirection.ASC,
              field: LibrarySortField.AUTHOR_ERA,
            },
          ],
        }).sort,
      ).toStrictEqual([
        { direction: "DESC", field: "AUTHOR_ERA" },
        { direction: "ASC", field: "AUTHOR_START_YEAR" },
      ]);
    });

    it("leads the order with each group, ahead of the sorts and in the direction its sort gave", () => {
      expect.hasAssertions();

      expect(
        parseLibraryArguments({
          group: [LibraryGroupField.ERA],
          sort: [
            { field: LibrarySortField.AUTHOR_START_YEAR },
            {
              direction: LibrarySortDirection.DESC,
              field: LibrarySortField.AUTHOR_ERA,
            },
          ],
        }).sort,
      ).toStrictEqual([
        { direction: "DESC", field: "AUTHOR_ERA" },
        { direction: "ASC", field: "AUTHOR_START_YEAR" },
      ]);
    });

    it("groups ascending and once, leaving the name tiebreak to the query", () => {
      expect.hasAssertions();

      expect(
        parseLibraryArguments({
          group: [LibraryGroupField.ERA, LibraryGroupField.ERA],
        }).sort,
      ).toStrictEqual([{ direction: "ASC", field: "AUTHOR_ERA" }]);
    });

    it("sorts by author name when the sort list is empty", () => {
      expect.hasAssertions();

      expect(parseLibraryArguments({ sort: [] }).sort).toStrictEqual([
        { direction: "ASC", field: "AUTHOR_NAME" },
      ]);
    });

    it("trims the search and keeps the page and page size it was given", () => {
      expect.hasAssertions();

      expect(
        parseLibraryArguments({ page: 3, pageSize: 10, search: "  vergil " }),
      ).toMatchObject({ page: 3, pageSize: 10, search: "vergil" });
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
