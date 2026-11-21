import { describe, expect, it } from "vitest";

import { readSorts, toSortInput } from "./use-gallery-search.utilities";

describe("use gallery search utilities", () => {
  describe(readSorts, () => {
    it("reads a lone field name with the link's direction, ascending by default", () => {
      expect(
        readSorts({ direction: "desc", maximum: 4, sort: "rows" }),
      ).toStrictEqual([{ direction: "desc", field: "rows" }]);
      expect(
        readSorts({ direction: undefined, maximum: 4, sort: "rows" }),
      ).toStrictEqual([{ direction: "asc", field: "rows" }]);
    });

    it("reads a list, each field once, a bad direction ascending, the most", () => {
      expect(
        readSorts({
          direction: undefined,
          maximum: 2,
          sort: [
            { direction: "desc", field: "rows" },
            { direction: "desc", field: "rows" },
            { direction: "sideways", field: "columns" },
            { direction: "asc", field: "lattice" },
            "nonsense",
          ],
        }),
      ).toStrictEqual([
        { direction: "desc", field: "rows" },
        { direction: "asc", field: "columns" },
      ]);
    });

    it("reads nothing from anything else", () => {
      expect(
        readSorts({ direction: "desc", maximum: 4, sort: undefined }),
      ).toStrictEqual([]);
    });
  });

  describe(toSortInput, () => {
    it("leaves the API's order when no field is named", () => {
      expect(toSortInput([])).toStrictEqual([]);
    });

    it("names each field and its direction as the API spells them", () => {
      expect(
        toSortInput([
          { direction: "asc", field: "rows" },
          { direction: "desc", field: "columns" },
        ]),
      ).toStrictEqual([
        { direction: "ASC", field: "rows" },
        { direction: "DESC", field: "columns" },
      ]);
    });
  });
});
