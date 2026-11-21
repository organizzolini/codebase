import { describe, expect, it } from "vitest";

import { moveItem } from "./gallery-segment.utilities";

describe(moveItem, () => {
  it("moves an item one step toward the start", () => {
    expect(moveItem(["a", "b", "c"], 1, -1)).toStrictEqual(["b", "a", "c"]);
  });

  it("moves an item one step toward the end", () => {
    expect(moveItem(["a", "b", "c"], 1, 1)).toStrictEqual(["a", "c", "b"]);
  });

  it("leaves the list as it is at either end", () => {
    expect(moveItem(["a", "b"], 0, -1)).toStrictEqual(["a", "b"]);
    expect(moveItem(["a", "b"], 1, 1)).toStrictEqual(["a", "b"]);
  });
});
