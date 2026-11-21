import { describe, expect, it } from "vitest";

import {
  AuthorEra,
  LibraryGroupField,
} from "../../../graphql/generated/operations";

import {
  describeGroup,
  groupHeading,
  toggleGroup,
} from "./library-group.utilities";

import type { LibraryAuthorRow } from "../library-grid/library-grid.types";

/** An author row with the era given. */
function rowOf(era: AuthorEra | null): LibraryAuthorRow {
  return {
    author: {
      endYear: null,
      era,
      fullName: null,
      id: "a1",
      name: "Ennius",
      slug: "ennius",
      startYear: null,
    },
    matches: [],
    workCount: 0,
    works: [],
  };
}

describe("library group utilities", () => {
  describe(groupHeading, () => {
    it("names the era an author falls under, or none", () => {
      expect(
        groupHeading(rowOf(AuthorEra.NeoLatin), [LibraryGroupField.Era]),
      ).toBe("Neo-Latin");
      expect(groupHeading(rowOf(null), [LibraryGroupField.Era])).toBe("No era");
    });

    it("has no heading when nothing is grouped", () => {
      expect(groupHeading(rowOf(AuthorEra.Late), [])).toBeNull();
    });
  });

  describe(describeGroup, () => {
    it("words the attribute", () => {
      expect(describeGroup(LibraryGroupField.Era)).toBe("Era");
    });
  });

  describe(toggleGroup, () => {
    it("adds a level, and removes it again", () => {
      expect(toggleGroup([], LibraryGroupField.Era)).toStrictEqual([
        LibraryGroupField.Era,
      ]);
      expect(
        toggleGroup([LibraryGroupField.Era], LibraryGroupField.Era),
      ).toStrictEqual([]);
    });
  });
});
