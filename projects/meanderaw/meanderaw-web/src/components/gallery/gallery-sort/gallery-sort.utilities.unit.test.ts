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

    it("falls back to rows for a field that is neither, or none", () => {
      expect(resolveSortField("nope", CATALOG)).toBe("rows");
      expect(resolveSortField(undefined, CATALOG)).toBe("rows");
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
