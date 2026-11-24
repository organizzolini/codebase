import { describe, expect, it } from "vitest";

import { moveListItem } from "./chip-menu.utilities";

describe(moveListItem, () => {
  it("moves an item one place left or right", () => {
    expect(moveListItem(["a", "b", "c"], 1, -1)).toStrictEqual(["b", "a", "c"]);
    expect(moveListItem(["a", "b", "c"], 1, 1)).toStrictEqual(["a", "c", "b"]);
  });

  it("leaves the list as it was when the move would leave it", () => {
    expect(moveListItem(["a", "b"], 0, -1)).toStrictEqual(["a", "b"]);
    expect(moveListItem(["a", "b"], 1, 1)).toStrictEqual(["a", "b"]);
    expect(moveListItem(["a"], 3, 1)).toStrictEqual(["a"]);
  });
});
