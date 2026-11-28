import { describe, expect, it } from "vitest";

import {
  getBoxElement,
  getLineFlags,
  markStripLines,
} from "./use-strip-lines.utilities";

describe("strip line utilities", () => {
  describe(getLineFlags, () => {
    it("opens the first line and closes the last", () => {
      expect(getLineFlags([0, 0, 0])).toStrictEqual([
        { isEnd: false, isStart: false },
        { isEnd: false, isStart: false },
        { isEnd: true, isStart: false },
      ]);
    });

    it("closes a line where the next item sits lower and opens the one below", () => {
      expect(getLineFlags([0, 0, 36, 36])).toStrictEqual([
        { isEnd: false, isStart: false },
        { isEnd: true, isStart: false },
        { isEnd: false, isStart: true },
        { isEnd: true, isStart: false },
      ]);
    });

    it("flags nothing for no items", () => {
      expect(getLineFlags([])).toStrictEqual([]);
    });
  });

  describe(getBoxElement, () => {
    it("climbs past elements that draw no box", () => {
      const parent = document.createElement("div");
      const root = document.createElement("div");

      root.style.display = "contents";
      parent.append(root);
      document.body.append(parent);

      expect(getBoxElement(root)).toBe(parent);
    });

    it("stops at an element that draws a box", () => {
      const root = document.createElement("div");

      document.body.append(root);

      expect(getBoxElement(root)).toBe(root);
    });
  });

  describe(markStripLines, () => {
    it("sets the flags as attributes on each item", () => {
      const root = document.createElement("div");
      const items = [0, 1].map(() => {
        const item = document.createElement("div");

        item.dataset["slot"] = "filter-chip";

        return item;
      });
      const tops = [0, 36];

      for (const [index, item] of items.entries()) {
        Object.defineProperty(item, "offsetTop", { value: tops[index] });
      }

      root.append(...items);
      markStripLines(root);

      expect(
        items.map((item) => Object.hasOwn(item.dataset, "lineStart")),
      ).toStrictEqual([false, true]);
      expect(
        items.map((item) => Object.hasOwn(item.dataset, "lineEnd")),
      ).toStrictEqual([true, true]);
    });
  });
});
