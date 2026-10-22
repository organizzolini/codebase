import { describe, expect, it } from "vitest";

import { compileNumberCondition } from "./event-filter-numbers";

describe(compileNumberCondition, () => {
  it("compiles a range of two numbers", () => {
    expect(compileNumberCondition("n", "between", [2, 5])).toStrictEqual({
      negated: false,
      parameters: [2, 5],
      sql: "(n between ? and ?)",
    });
  });

  it("flips a range that is negated", () => {
    expect(
      compileNumberCondition("n", "not_between", ["2", "5"]),
    ).toMatchObject({ negated: true, parameters: [2, 5] });
  });

  it("reads a missing or blank end of a range as no condition", () => {
    expect(compileNumberCondition("n", "between", [null, 5])).toBeNull();
    expect(compileNumberCondition("n", "between", [2, null])).toBeNull();
    expect(compileNumberCondition("n", "between", [" ", 5])).toBeNull();
    expect(compileNumberCondition("n", "between", [2, ""])).toBeNull();
  });

  it("reads a range that is not two ordered numbers as no condition", () => {
    expect(compileNumberCondition("n", "between", [5, 2])).toBeNull();
    expect(compileNumberCondition("n", "between", ["a", 2])).toBeNull();
    expect(compileNumberCondition("n", "between", [2])).toBeNull();
    expect(compileNumberCondition("n", "between", undefined)).toBeNull();
  });
});
