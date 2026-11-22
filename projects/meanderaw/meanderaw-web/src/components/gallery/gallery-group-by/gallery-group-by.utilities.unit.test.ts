import { describe, expect, it } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../../testing/meanders-api";

import {
  createGroupFields,
  resolveGrouping,
  toSequenceSorts,
} from "./gallery-group-by.utilities";

describe("gallery group by", () => {
  describe(createGroupFields, () => {
    it("lists rows and columns, then every characteristic, each with its category and kind", () => {
      expect(
        createGroupFields(FIXTURE_CHARACTERISTICS).map(
          ({ category, key, label, type }) => [category, key, label, type],
        ),
      ).toStrictEqual([
        ["shape", "rows", "Rows", "number"],
        ["shape", "columns", "Columns", "number"],
        ["submatrix", "isChain", "Chain", "boolean"],
        ["path", "junctionCount", "Junction count", "number"],
      ]);
    });
  });

  describe(resolveGrouping, () => {
    it("keeps the levels the catalog can group by, once each, in order", () => {
      expect(
        resolveGrouping(
          ["columns", "nonsense", "columns", "lattice", "isChain"],
          createGroupFields(FIXTURE_CHARACTERISTICS),
        ),
      ).toStrictEqual(["columns", "isChain"]);
    });

    it("groups by rows when the link names no grouping, and reads flat for an empty list", () => {
      const fields = createGroupFields(FIXTURE_CHARACTERISTICS);

      expect(resolveGrouping(undefined, fields)).toStrictEqual(["rows"]);
      expect(resolveGrouping([], fields)).toStrictEqual([]);
      expect(resolveGrouping(["nonsense"], fields)).toStrictEqual([]);
    });
  });

  describe(toSequenceSorts, () => {
    it("puts each level first, ascending, then the person's sorts", () => {
      expect(
        toSequenceSorts(
          ["rows", "columns"],
          [{ direction: "desc", field: "junctionCount" }],
        ),
      ).toStrictEqual([
        { direction: "asc", field: "rows" },
        { direction: "asc", field: "columns" },
        { direction: "desc", field: "junctionCount" },
      ]);
    });

    it("drops a sort on a level, which the level orders already", () => {
      expect(
        toSequenceSorts(["rows"], [{ direction: "desc", field: "rows" }]),
      ).toStrictEqual([{ direction: "asc", field: "rows" }]);
    });

    it("is the person's sorts alone for a flat gallery", () => {
      expect(
        toSequenceSorts([], [{ direction: "desc", field: "rows" }]),
      ).toStrictEqual([{ direction: "desc", field: "rows" }]);
    });
  });
});
