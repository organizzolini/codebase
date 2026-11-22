import { describe, expect, it } from "vitest";

import { serveMeandersApi } from "../../../../testing/meanders-api";

import { findGallery, parseGroups } from "./meanders-api.utilities";

/** A request for the first 24 meanders, over the default rows rule. */
const REQUEST = {
  filter: undefined,
  grouping: [],
  repeats: 12,
  rows: { operator: "eq", value: 4 },
  size: 24,
  sorts: [{ direction: "desc", field: "junctionCount" }],
} as const;

describe("meanders api utilities", () => {
  describe(findGallery, () => {
    it("reads the first page alone for a flat gallery, in the sorts", async () => {
      const api = serveMeandersApi(30);
      const { groups, page } = await findGallery(REQUEST);

      expect(groups).toBeUndefined();
      expect(page.edges).toHaveLength(24);
      expect(api.groupRequests).toHaveLength(0);
      expect(api.requests[0]).toMatchObject({
        first: 24,
        sort: [{ direction: "DESC", field: "junctionCount" }],
      });
    });

    it("reads the groups with the first page, ordered by each level, then the sorts", async () => {
      const api = serveMeandersApi(30);
      const { groups, page } = await findGallery({
        ...REQUEST,
        grouping: ["columns", "isChain"],
      });

      expect(
        groups?.map(({ field, value }) => `${field}=${value}`),
      ).toStrictEqual(["columns=1", "columns=2", "columns=3"]);
      expect(page.totalCount).toBe(30);
      expect(api.groupRequests[0]?.groupBy).toStrictEqual([
        { field: "columns" },
        { field: "isChain" },
      ]);
      expect(api.requests[0]?.sort).toStrictEqual([
        { direction: "ASC", field: "columns" },
        { direction: "ASC", field: "isChain" },
        { direction: "DESC", field: "junctionCount" },
      ]);
    });
  });

  describe(parseGroups, () => {
    it("reads each level's groups into the levels asked for", () => {
      const raw = [
        {
          count: 2,
          field: "isChain",
          groups: [{ count: 2, field: "lattice", value: "0" }],
          value: "false",
        },
      ];

      expect(parseGroups(raw, ["isChain", "lattice"])).toStrictEqual([
        {
          count: 2,
          field: "isChain",
          groups: [{ count: 2, field: "lattice", groups: [], value: "0" }],
          value: "false",
        },
      ]);
    });

    it("takes the last level for a leaf whether or not it carries groups", () => {
      const [group] = parseGroups(
        [{ count: 1, field: "lattice", groups: [], value: "0" }],
        ["lattice"],
      );

      expect(group?.groups).toStrictEqual([]);
    });

    it("refuses a level that is missing, out of place, or malformed", () => {
      expect(() =>
        parseGroups(
          [{ count: 1, field: "isChain", value: "true" }],
          ["isChain", "lattice"],
        ),
      ).toThrow(/array/iu);
      expect(() =>
        parseGroups([{ count: 1, field: "lattice", value: "0" }], ["isChain"]),
      ).toThrow(/in place of/u);
      expect(() =>
        parseGroups([{ count: -1, field: "lattice", value: "0" }], ["lattice"]),
      ).toThrow(/count/u);
      expect(() => parseGroups([], [])).toThrow(/one to four/u);
      expect(() => parseGroups([], ["a", "b", "c", "d", "e"])).toThrow(
        /one to four/u,
      );
    });
  });
});
