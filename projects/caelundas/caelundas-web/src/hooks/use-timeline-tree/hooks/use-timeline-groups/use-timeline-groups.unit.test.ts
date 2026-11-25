import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useTimelineGroups } from "./use-timeline-groups";

import type { TimelineRows } from "../../../../components/calendar-display/calendar-timeline/calendar-timeline.types";

const ROWS: TimelineRows = {
  counts: new Map(),
  events: [],
  groups: new Map([
    ["/0:a", { fallback: false, key: "a", level: 0 }],
    ["/0:b", { fallback: false, key: "b", level: 0 }],
  ]),
  resources: [
    {
      children: [{ children: [], id: "/0:a:events", title: "" }],
      id: "/0:a",
      title: "a",
    },
    {
      children: [{ children: [], id: "/0:b:events", title: "" }],
      id: "/0:b",
      title: "b",
    },
  ],
};

describe(useTimelineGroups, () => {
  it("returns its result", () => {
    const { result } = renderHook(() => useTimelineGroups(ROWS, []));

    expect(result.current).toStrictEqual({
      collapsedGroups: expect.any(Array) as unknown[],
      onCollapsedGroupsChange: expect.any(Function) as () => void,
      renderResourceLabel: expect.any(Function) as () => void,
    });
  });

  it("opens only the first group, and follows the Gantt's toggles", () => {
    const { result } = renderHook(() => useTimelineGroups(ROWS, []));

    expect(result.current.collapsedGroups).toStrictEqual(["/0:b"]);

    act(() => {
      result.current.onCollapsedGroupsChange(["/0:b", "/0:a"]);
    });

    expect(result.current.collapsedGroups).toStrictEqual(["/0:a", "/0:b"]);

    act(() => {
      result.current.onCollapsedGroupsChange(["/0:a"]);
    });

    expect(result.current.collapsedGroups).toStrictEqual(["/0:a"]);
  });
});
