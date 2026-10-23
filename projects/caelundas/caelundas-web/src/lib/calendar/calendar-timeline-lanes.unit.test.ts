import { describe, expect, it } from "vitest";

import { packTimelineLanes } from "./calendar-timeline-lanes";

import type { TimelineBar } from "./calendar-timeline";
import type { GanttEvent, GanttResource } from "@codebase/presentation";

const HOUR = 3_600_000;

function bar(
  id: string,
  startHour: number,
  endHour: number,
  resourceId = "row",
): GanttEvent<TimelineBar> {
  return {
    end: new Date(endHour * HOUR),
    id,
    resourceId,
    start: new Date(startHour * HOUR),
    title: id,
  };
}

const ROWS: GanttResource[] = [
  {
    children: [
      { children: [], id: "row", title: "Mars" },
      { children: [], id: "other", title: "Venus" },
    ],
    id: "group",
    title: "Aspect",
  },
];

function lanesOf(
  bars: readonly GanttEvent<TimelineBar>[],
  reach = 0,
): Record<string, string | undefined> {
  return Object.fromEntries(
    packTimelineLanes(ROWS, bars, reach).bars.map((packed) => [
      packed.id,
      packed.resourceId,
    ]),
  );
}

describe(packTimelineLanes, () => {
  it("keeps bars that do not overlap in the row's first lane", () => {
    const layout = packTimelineLanes(ROWS, [bar("a", 0, 1), bar("b", 1, 2)], 0);

    expect(layout.bars.map((packed) => packed.resourceId)).toStrictEqual([
      "row",
      "row",
    ]);
    expect(layout.resources).toStrictEqual([
      {
        children: [
          { children: [], id: "row", title: "Mars" },
          { children: [], id: "other", title: "Venus" },
        ],
        id: "group",
        title: "Aspect",
      },
    ]);
  });

  it("moves a bar that overlaps into a lane beneath, with a row of its own", () => {
    const layout = packTimelineLanes(
      ROWS,
      [bar("long", 0, 10), bar("inside", 2, 3), bar("later", 4, 5)],
      0,
    );

    expect(lanesOf([bar("long", 0, 10), bar("inside", 2, 3)])).toStrictEqual({
      inside: "row#1",
      long: "row",
    });
    // The second bar inside the long one fits in the lane the first left.
    expect(layout.bars.map((packed) => packed.resourceId)).toStrictEqual([
      "row",
      "row#1",
      "row#1",
    ]);
    expect(layout.resources[0]?.children?.map((row) => row.id)).toStrictEqual([
      "row",
      "row#1",
      "other",
    ]);
    expect(layout.resources[0]?.children?.[1]?.title).toBe("");
  });

  it("holds a lane for as long as a marker's reach, however short it is", () => {
    expect(
      lanesOf([bar("a", 0, 0), bar("b", 1, 1), bar("c", 5, 5)], 3 * HOUR),
    ).toStrictEqual({ a: "row", b: "row#1", c: "row" });
  });

  it("packs each row on its own and leaves a bar in an unknown row alone", () => {
    expect(
      lanesOf([
        bar("a", 0, 5),
        bar("b", 1, 2, "other"),
        bar("c", 1, 2, "missing"),
      ]),
    ).toStrictEqual({ a: "row", b: "other", c: "missing" });
  });
});
