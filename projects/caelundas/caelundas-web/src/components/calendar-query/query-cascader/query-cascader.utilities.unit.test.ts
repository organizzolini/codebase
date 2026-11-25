import { describe, expect, it } from "vitest";

import {
  keepHiddenValues,
  resolveSelectable,
  toExpansion,
} from "./query-cascader.utilities";

describe("query-cascader utilities", () => {
  describe(toExpansion, () => {
    it("carries only the expansion props it is given", () => {
      const change = (): void => undefined;

      expect(toExpansion(undefined, undefined, undefined)).toStrictEqual({});
      expect(toExpansion(["a"], ["b"], change)).toStrictEqual({
        defaultExpanded: ["a"],
        expanded: ["b"],
        onExpandedChange: change,
      });
    });
  });

  describe(resolveSelectable, () => {
    it("gives every row to a cascade, and only leaves to anything else", () => {
      expect(resolveSelectable(true, undefined)).toBe("any");
      expect(resolveSelectable(false, undefined)).toBe("leaf");
    });

    it("gives the rows a predicate names, whatever the cascade", () => {
      const predicate = (): boolean => true;

      expect(resolveSelectable(true, predicate)).toBe(predicate);
      expect(resolveSelectable(false, predicate)).toBe(predicate);
    });
  });

  describe(keepHiddenValues, () => {
    const items = [
      { children: [{ label: "B", value: "b" }], label: "A", value: "a" },
    ];

    it("adds back the earlier values the list does not offer", () => {
      expect(keepHiddenValues(["b"], ["a", "gone"], items)).toStrictEqual([
        "b",
        "gone",
      ]);
    });

    it("keeps nothing extra when the list offers every earlier value", () => {
      expect(keepHiddenValues(["a"], ["a", "b"], items)).toStrictEqual(["a"]);
    });
  });
});
