import { describe, expect, it } from "vitest";

import { FIXTURE_CHARACTERISTICS } from "../../../../testing/meanders-api";

import { createSortFields, resolveSorts } from "./gallery-sort.utilities";

const CATALOG = FIXTURE_CHARACTERISTICS;

describe("gallery sort", () => {
  describe(resolveSorts, () => {
    it("keeps shape fields and keys in the catalog, once each, in order", () => {
      expect(
        resolveSorts(
          [
            { direction: "desc", field: "isChain" },
            { direction: "asc", field: "rows" },
            { direction: "desc", field: "isChain" },
          ],
          CATALOG,
        ),
      ).toStrictEqual([
        { direction: "desc", field: "isChain" },
        { direction: "asc", field: "rows" },
      ]);
    });

    it("falls back to rows ascending when none is left", () => {
      const rows = [{ direction: "asc", field: "rows" }];

      expect(
        resolveSorts([{ direction: "asc", field: "nope" }], CATALOG),
      ).toStrictEqual(rows);
      expect(resolveSorts(undefined, CATALOG)).toStrictEqual(rows);
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
