import { describe, expect, it } from "vitest";

import {
  getGroupHeight,
  getGroupIndent,
  getGroupTop,
} from "./table-group-row.utilities";

describe("table-group-row utilities", () => {
  describe(getGroupIndent, () => {
    it("indents a group by a step for each level beneath", () => {
      expect(getGroupIndent(0)).toBe("0rem");
      expect(getGroupIndent(2)).toBe("2.5rem");
    });
  });

  describe(getGroupTop, () => {
    it("sticks the first level right below the table's header", () => {
      expect(getGroupTop(0)).toBe("2.5rem");
    });

    it("stacks each deeper level one header lower", () => {
      expect(getGroupTop(1)).toBe("4.75rem");
      expect(getGroupTop(2)).toBe("7rem");
    });
  });

  describe(getGroupHeight, () => {
    it("is the height the offsets are counted in", () => {
      expect(getGroupHeight()).toBe("2.25rem");
    });
  });
});
