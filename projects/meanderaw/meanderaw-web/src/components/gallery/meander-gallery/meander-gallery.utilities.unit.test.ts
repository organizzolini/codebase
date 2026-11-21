import { describe, expect, it } from "vitest";

import { listActiveKeys } from "./meander-gallery.utilities";

describe(listActiveKeys, () => {
  it("lists the grouping levels, the sort and every rule of the filter, nested ones too, each once", () => {
    expect(
      listActiveKeys({
        filter: {
          combinator: "or",
          rules: [
            { field: "isChain", operator: "is", value: true },
            {
              combinator: "and",
              rules: [
                { field: "junctionCount", operator: "gte", value: 3 },
                { field: "isChain", operator: "is", value: true },
              ],
            },
          ],
        },
        grouping: ["junctionCount", "rows"],
        sort: "strokeCount",
      }).toSorted(),
    ).toStrictEqual(["isChain", "junctionCount", "rows", "strokeCount"]);
  });

  it("lists nothing for a page with no grouping, sort or filter", () => {
    expect(
      listActiveKeys({ filter: undefined, grouping: [], sort: undefined }),
    ).toStrictEqual([]);
  });
});
