import { describe, expect, it } from "vitest";

import { resolveSelectable } from "./query-cascader.utilities";

describe("query-cascader utilities", () => {
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
});
