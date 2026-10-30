import { describe, expect, it } from "vitest";

import {
  compileNumberCondition,
  readNumberRange,
  readSingleNumber,
} from "./event-filter-numbers.utilities";

describe("event-filter-numbers utilities", () => {
  describe(compileNumberCondition, () => {
    it("compiles a range of two numbers", () => {
      expect(compileNumberCondition("n", "between", [2, 5])).toStrictEqual({
        negated: false,
        parameters: [2, 5],
        sql: "(n between ? and ?)",
      });
    });

    it("flips a range that is negated", () => {
      expect(compileNumberCondition("n", "not_between", [2, 5])).toMatchObject({
        negated: true,
        parameters: [2, 5],
      });
    });

    it("compiles a comparison with one number", () => {
      expect(compileNumberCondition("n", "gt", [3])).toStrictEqual({
        negated: false,
        parameters: [3],
        sql: "(n > ?)",
      });
    });

    it("compiles no condition without operands or a known comparison", () => {
      expect(compileNumberCondition("n", "between", null)).toBeNull();
      expect(compileNumberCondition("n", "unknown", [3])).toBeNull();
    });
  });

  describe(readNumberRange, () => {
    it("reads two numbers written as numbers or text", () => {
      expect(readNumberRange(["2", "5"])).toStrictEqual([2, 5]);
    });

    it("reads a missing or blank end of a range as no range", () => {
      expect(readNumberRange([null, 5])).toBeNull();
      expect(readNumberRange([2, null])).toBeNull();
      expect(readNumberRange([" ", 5])).toBeNull();
      expect(readNumberRange([2, ""])).toBeNull();
    });

    it("reads a range that is not two ordered numbers as no range", () => {
      expect(readNumberRange([5, 2])).toBeNull();
      expect(readNumberRange(["a", 2])).toBeNull();
      expect(readNumberRange([2])).toBeNull();
      expect(readNumberRange(undefined)).toBeNull();
    });
  });

  describe(readSingleNumber, () => {
    it("reads one number written as a number or text", () => {
      expect(readSingleNumber(" 7 ")).toStrictEqual([7]);
      expect(readSingleNumber(-1.5)).toStrictEqual([-1.5]);
    });

    it("reads a list, a blank, or text that is not a number as no number", () => {
      expect(readSingleNumber([7])).toBeNull();
      expect(readSingleNumber("")).toBeNull();
      expect(readSingleNumber(null)).toBeNull();
      expect(readSingleNumber("seven")).toBeNull();
    });
  });
});
