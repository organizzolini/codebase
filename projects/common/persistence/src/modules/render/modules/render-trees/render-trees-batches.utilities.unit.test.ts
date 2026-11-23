import { describe, expect, it } from "vitest";

import { chunkIds } from "./render-trees-batches.utilities";

describe(chunkIds, () => {
  it("splits ids into batches of the given size, keeping their order", () => {
    expect(chunkIds(["a", "b", "c", "d", "e"], 2)).toStrictEqual([
      ["a", "b"],
      ["c", "d"],
      ["e"],
    ]);
  });

  it("returns no batch for no ids", () => {
    expect(chunkIds([], 2)).toStrictEqual([]);
  });

  it("keeps every id in one batch when the size is larger than the list", () => {
    expect(chunkIds(["a", "b"], 500)).toStrictEqual([["a", "b"]]);
  });
});
