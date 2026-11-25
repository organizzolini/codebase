import { describe, expect, it } from "vitest";

import {
  getMaximumNameWidth,
  measureTreePanel,
  measureTreeWidths,
  toTreePaneStyle,
} from "./timeline-tree-width.utilities";

import type { GanttResource } from "@codebase/presentation";

const LIMITS = { max: 600, min: 176 };

const NESTED: GanttResource[] = [
  {
    children: [
      {
        children: [{ id: "c", title: "No Zodiac Sign Anywhere At All" }],
        id: "b",
        title: "Luminary",
      },
    ],
    id: "a",
    title: "Simple",
  },
];

describe("timeline tree width", () => {
  it("keeps the minimum when the rows are narrow", () => {
    const widths = measureTreeWidths([{ id: "a", title: "A" }], [], LIMITS);

    expect(widths.name).toBe(176);
    expect(widths.pane).toBe(176 + 88 + 8);
  });

  it("widens to fit the deepest open row", () => {
    const open = measureTreeWidths(NESTED, [], LIMITS);
    const closed = measureTreeWidths(NESTED, ["b"], LIMITS);

    expect(open.name).toBeGreaterThan(closed.name);
    expect(open.name % 8).toBe(0);
  });

  it("ignores the rows a closed group hides", () => {
    const widths = measureTreeWidths(NESTED, ["a"], LIMITS);

    expect(widths.name).toBe(176);
  });

  it("stops at the maximum", () => {
    const widths = measureTreeWidths(NESTED, [], { max: 200, min: 176 });

    expect(widths.name).toBe(200);
  });

  it("gives a blank row no width", () => {
    const widths = measureTreeWidths([{ id: "a", title: "" }], [], LIMITS);

    expect(widths.name).toBe(176);
  });

  it("caps the names column at a share of the window less the columns beside", () => {
    expect(getMaximumNameWidth(0)).toBe(
      Math.floor(window.innerWidth * 0.6) - 88 - 8,
    );
  });

  it("never caps the names column below its minimum", () => {
    expect(getMaximumNameWidth(5000)).toBe(5000);
  });

  it("fits a panel's names column and width to the rows", () => {
    const panel = measureTreePanel(NESTED, [], {
      minWidth: 120,
      nameColumnWidth: 104,
      width: 168,
    });

    expect(panel.minWidth).toBe(120);
    expect(panel.nameColumnWidth).toBeGreaterThan(104);
    expect(panel.width).toBe(panel.nameColumnWidth + 88 + 8);
  });

  it("styles the pane's width, capped to the window's share", () => {
    expect(toTreePaneStyle(400)).toStrictEqual({
      "--timeline-tree-width": "min(25rem, 60%)",
    });
  });
});
