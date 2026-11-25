import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useTimelineTree } from "./use-timeline-tree";

import type { GanttResource } from "@codebase/presentation";

const BASE = { nameColumnWidth: 176, width: 272 };

const ROWS: GanttResource[] = [
  {
    children: [{ id: "b", title: "No Zodiac Sign Anywhere At All" }],
    id: "a",
    title: "Simple",
  },
];

describe(useTimelineTree, () => {
  it("returns its result", () => {
    const { result } = renderHook(() => useTimelineTree(ROWS, [], BASE));

    expect(result.current).toStrictEqual({
      panel: { nameColumnWidth: 344, width: 440 },
      style: { "--timeline-tree-width": "min(27.5rem, 60%)" },
    });
  });

  it("narrows the panel when a group closes", () => {
    const open = renderHook(() => useTimelineTree(ROWS, [], BASE));
    const closed = renderHook(() => useTimelineTree(ROWS, ["a"], BASE));

    expect(closed.result.current.panel.nameColumnWidth).toBe(176);
    expect(open.result.current.panel.nameColumnWidth).toBeGreaterThan(
      closed.result.current.panel.nameColumnWidth,
    );
  });
});
