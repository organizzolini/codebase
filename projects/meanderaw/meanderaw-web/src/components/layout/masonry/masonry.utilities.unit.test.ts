import { describe, expect, it } from "vitest";

import { dealColumns } from "./masonry.utilities";

describe(dealColumns, () => {
  it("is one column for fewer than one", () => {
    expect(dealColumns(["a", "b"], 0)).toStrictEqual([["a", "b"]]);
  });

  it("keeps each card in its column when more are added at the end", () => {
    expect(dealColumns(["a", "b", "c"], 2)).toStrictEqual([["a", "c"], ["b"]]);
    expect(dealColumns(["a", "b", "c", "d", "e"], 2)).toStrictEqual([
      ["a", "c", "e"],
      ["b", "d"],
    ]);
  });
});
