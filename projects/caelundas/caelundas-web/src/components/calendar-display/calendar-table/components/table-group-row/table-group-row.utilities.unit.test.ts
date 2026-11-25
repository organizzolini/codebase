import { describe, expect, it } from "vitest";

import {
  createGroupColors,
  createNodeColors,
  getGroupHeight,
  getGroupIndent,
  getGroupTint,
  getGroupTop,
} from "./table-group-row.utilities";

import type { EventGroupNode } from "../../../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";

describe("table-group-row utilities", () => {
  describe(createGroupColors, () => {
    it("maps each legend key to its color", () => {
      const colors = createGroupColors([
        { color: "red", depth: 0, key: "a", label: "A" },
      ]);

      expect(colors.get("a")).toBe("red");
    });
  });

  describe(createNodeColors, () => {
    const make = (
      id: string,
      key: null | string,
      children: EventGroupNode[] = [],
    ): EventGroupNode => ({
      children,
      count: 0,
      events: [],
      id,
      key,
      label: id,
      level: 0,
      path: [id],
    });

    it("colors a tag from the legend and the groups beneath it near it", () => {
      const child = make("p/c", "c");
      const root = { ...make("p", "p"), children: [child] };
      const colors = createNodeColors([root], new Map([["p", "#ff0000"]]));

      expect(colors.get("p")).toBe("#ff0000");
      expect(colors.get("p/c")).toMatch(/^oklch\(/u);
    });

    it("leaves an uncolored top group, and its uncolored children, plain", () => {
      expect(createNodeColors([make("n", null) as never], new Map()).size).toBe(
        0,
      );
    });
  });

  describe(getGroupTint, () => {
    const node = {
      children: [],
      count: 0,
      events: [],
      id: "a",
      key: "a",
      label: "A",
      level: 0,
      path: ["A"],
    };

    it("tints a group whose key has a color", () => {
      const tint = getGroupTint(new Map([["a", "red"]]), node);

      expect(tint?.background).toContain("red");
    });

    it("gives no tint without colors, a key, or a legend entry", () => {
      expect(getGroupTint(undefined, node)).toBeUndefined();
      expect(getGroupTint(new Map(), node)).toBeUndefined();
      expect(getGroupTint(new Map([["x", "red"]]), node)).toBeUndefined();
    });
  });

  describe(getGroupIndent, () => {
    it("indents a group by a step for each level beneath", () => {
      expect(getGroupIndent(0)).toBe("0rem");
      expect(getGroupIndent(2)).toBe("2.5rem");
    });
  });

  describe(getGroupTop, () => {
    it("sticks the first level at the top of the scroller", () => {
      expect(getGroupTop(0)).toBe("0rem");
    });

    it("stacks each deeper level one header lower", () => {
      expect(getGroupTop(1)).toBe("2.25rem");
      expect(getGroupTop(2)).toBe("4.5rem");
    });
  });

  describe(getGroupHeight, () => {
    it("is the height the offsets are counted in", () => {
      expect(getGroupHeight()).toBe("2.25rem");
    });
  });
});
