import { describe, expect, it } from "vitest";

import { moveValue } from "./library-chip.utilities";

describe(moveValue, () => {
  it("moves a value one place left or right", () => {
    expect(moveValue(["a", "b", "c"], 1, -1)).toStrictEqual(["b", "a", "c"]);
    expect(moveValue(["a", "b", "c"], 1, 1)).toStrictEqual(["a", "c", "b"]);
  });

  it("leaves the list as it is when the value would leave either end", () => {
    expect(moveValue(["a", "b"], 0, -1)).toStrictEqual(["a", "b"]);
    expect(moveValue(["a", "b"], 1, 1)).toStrictEqual(["a", "b"]);
  });
});
