import { describe, expect, it } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../../testing/meanders-api";

import { createSortFields, resolveSortField } from "./gallery-sort.utilities";

const CATALOG = FIXTURE_CHARACTERISTICS;

describe("gallery sort", () => {
  describe(resolveSortField, () => {
    it("keeps a shape field and a key in the catalog", () => {
      expect(resolveSortField("rows", CATALOG)).toBe("rows");
      expect(resolveSortField("isChain", CATALOG)).toBe("isChain");
    });

    it("drops a field that is neither, and has nothing to drop without one", () => {
      expect(resolveSortField("nope", CATALOG)).toBeUndefined();
      expect(resolveSortField(undefined, CATALOG)).toBeUndefined();
    });
  });

  describe(createSortFields, () => {
    it("lists the shape fields, then the catalog", () => {
      expect(
        createSortFields(CATALOG).map(({ category, key }) => [category, key]),
      ).toStrictEqual([
        ["shape", "rows"],
        ["shape", "columns"],
        ["shape", "lattice"],
        ["shape", "repeats"],
        ["shape", "isHardcoded"],
        ["shape", "code"],
        ["submatrix", "isChain"],
        ["path", "junctionCount"],
      ]);
    });
  });
});
