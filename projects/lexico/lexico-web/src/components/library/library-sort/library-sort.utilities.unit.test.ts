import { describe, expect, it } from "vitest";

import {
  LibrarySortDirection,
  LibrarySortField,
} from "../../../graphql/generated/operations";

import { describeSort, flipSort, toggleSort } from "./library-sort.utilities";

const ERA = {
  direction: LibrarySortDirection.Asc,
  field: LibrarySortField.AuthorEra,
};
const TITLE = {
  direction: LibrarySortDirection.Desc,
  field: LibrarySortField.TextTitle,
};

describe("library sort utilities", () => {
  describe(describeSort, () => {
    it("words an attribute", () => {
      expect(describeSort(LibrarySortField.AuthorEra).label).toBe("Author era");
    });
  });

  describe(toggleSort, () => {
    it("adds an attribute last, ascending", () => {
      expect(toggleSort([ERA], LibrarySortField.TextTitle)).toStrictEqual([
        ERA,
        {
          direction: LibrarySortDirection.Asc,
          field: LibrarySortField.TextTitle,
        },
      ]);
    });

    it("removes an attribute that is already sorted, keeping the order of the rest", () => {
      expect(
        toggleSort([ERA, TITLE], LibrarySortField.AuthorEra),
      ).toStrictEqual([TITLE]);
    });
  });

  describe(flipSort, () => {
    it("reverses the direction of one attribute in place", () => {
      expect(flipSort([ERA, TITLE], LibrarySortField.AuthorEra)).toStrictEqual([
        {
          direction: LibrarySortDirection.Desc,
          field: LibrarySortField.AuthorEra,
        },
        TITLE,
      ]);
      expect(
        flipSort([ERA, TITLE], LibrarySortField.TextTitle)[1],
      ).toStrictEqual({
        direction: LibrarySortDirection.Asc,
        field: LibrarySortField.TextTitle,
      });
    });
  });
});
