import { describe, expect, it } from "vitest";

import { getRowOffsets, getVirtualWindow } from "./calendar-virtual-window";

describe("calendar virtual window", () => {
  describe(getRowOffsets, () => {
    it("starts each row where the rows above it end", () => {
      expect(getRowOffsets([36, 56, 56, 36])).toStrictEqual([
        0, 36, 92, 148, 184,
      ]);
    });

    it("gives an empty list one offset, its zero height", () => {
      expect(getRowOffsets([])).toStrictEqual([0]);
    });
  });

  describe(getVirtualWindow, () => {
    // Ten rows of 50 pixels: row 4 spans 200 to 250.
    const offsets = getRowOffsets(Array.from({ length: 10 }, () => 50));

    it("covers the rows the viewport shows at the top", () => {
      expect(
        getVirtualWindow({
          offsets,
          overscan: 0,
          scrollTop: 0,
          viewportHeight: 120,
        }),
      ).toStrictEqual({ end: 3, start: 0 });
    });

    it("covers a row the viewport shows only part of", () => {
      expect(
        getVirtualWindow({
          offsets,
          overscan: 0,
          scrollTop: 210,
          viewportHeight: 100,
        }),
      ).toStrictEqual({ end: 7, start: 4 });
    });

    it("adds the overscan on both sides, clamped to the list", () => {
      expect(
        getVirtualWindow({
          offsets,
          overscan: 2,
          scrollTop: 210,
          viewportHeight: 100,
        }),
      ).toStrictEqual({ end: 9, start: 2 });
      expect(
        getVirtualWindow({
          offsets,
          overscan: 5,
          scrollTop: 0,
          viewportHeight: 50,
        }),
      ).toStrictEqual({ end: 6, start: 0 });
    });

    it("reaches the last row once scrolled to the bottom", () => {
      expect(
        getVirtualWindow({
          offsets,
          overscan: 1,
          scrollTop: 400,
          viewportHeight: 100,
        }),
      ).toStrictEqual({ end: 10, start: 7 });
    });

    it("stays inside the list when scrolled past its end", () => {
      expect(
        getVirtualWindow({
          offsets,
          overscan: 0,
          scrollTop: 9000,
          viewportHeight: 100,
        }),
      ).toStrictEqual({ end: 10, start: 9 });
    });

    it("covers nothing in an empty list", () => {
      expect(
        getVirtualWindow({
          offsets: [0],
          overscan: 3,
          scrollTop: 0,
          viewportHeight: 100,
        }),
      ).toStrictEqual({ end: 0, start: 0 });
    });

    it("keeps a million rows to the handful on screen", () => {
      const many = getRowOffsets(Array.from({ length: 1_000_000 }, () => 40));
      const window = getVirtualWindow({
        offsets: many,
        overscan: 4,
        scrollTop: 20_000_000,
        viewportHeight: 800,
      });

      expect(window).toStrictEqual({ end: 500_024, start: 499_996 });
    });
  });
});
