import {
  clusterTimelineBars,
  getClusterSpan,
} from "./calendar-timeline-clusters.utilities";
import { LABELLED_REACH } from "./calendar-timeline-lanes.constants";

import type { TimelineLayout } from "./calendar-timeline-lanes.types";
import type { TimelineBar, TimelineRows } from "./calendar-timeline.types";
import type {
  GanttEvent,
  GanttResource,
  GanttScale,
} from "@codebase/presentation";

// 🌎 Public Functions

/**
 * Lays one row's bars out as the timeline draws them: markers that would overlap gathered into counts, then bars moved into lanes.
 */
export function createTimelineLayout(
  rows: TimelineRows,
  view: Readonly<{ scale: GanttScale; zoom: number }>,
): TimelineLayout {
  const span = getClusterSpan(view.scale, view.zoom);

  return packTimelineLanes(
    rows.resources,
    clusterTimelineBars(rows.events, span),
    view.scale === "day" ? span * LABELLED_REACH : span,
  );
}

/**
 * Moves a row's overlapping bars into lanes beneath it, so nothing draws over anything; each extra lane gets an untitled row.
 */
export function packTimelineLanes(
  resources: readonly GanttResource[],
  bars: readonly GanttEvent<TimelineBar>[],
  reach: number,
): TimelineLayout {
  const byRow = new Map<string, GanttEvent<TimelineBar>[]>();

  for (const bar of bars) {
    const rowId = bar.resourceId ?? "";
    const row = byRow.get(rowId) ?? [];

    row.push(bar);
    byRow.set(rowId, row);
  }

  const packed: GanttEvent<TimelineBar>[] = [];
  const laneCounts = new Map<string, number>();

  for (const [rowId, row] of byRow) {
    const lanes = assignLanes(rowId, row, reach);

    packed.push(...lanes.bars);
    laneCounts.set(rowId, lanes.count);
  }

  return { bars: packed, resources: addLaneRows(resources, laneCounts) };
}

/**
 * Copies the rows with a row for each lane a row needs beyond its first, placed straight after it.
 */
function addLaneRows(
  resources: readonly GanttResource[],
  laneCounts: ReadonlyMap<string, number>,
): GanttResource[] {
  const copy: GanttResource[] = [];
  const pending = [{ source: resources, target: copy }];

  for (let next = pending.pop(); next !== undefined; next = pending.pop()) {
    for (const node of next.source) {
      const children: GanttResource[] = [];

      next.target.push({ ...node, children });

      if (node.children !== undefined && node.children.length > 0) {
        pending.push({ source: node.children, target: children });
        continue;
      }

      for (let lane = 1; lane < (laneCounts.get(node.id) ?? 1); lane += 1) {
        next.target.push({
          children: [],
          id: `${node.id}#${String(lane)}`,
          title: "",
        });
      }
    }
  }

  return copy;
}

/**
 * Puts each bar, in start order, in the first lane free by then, and says how many lanes that took.
 */
function assignLanes(
  rowId: string,
  row: readonly GanttEvent<TimelineBar>[],
  reach: number,
): { bars: GanttEvent<TimelineBar>[]; count: number } {
  const bars: GanttEvent<TimelineBar>[] = [];
  const lanes: number[] = [];

  for (const bar of row.toSorted(
    (left, right) => left.start.getTime() - right.start.getTime(),
  )) {
    const start = bar.start.getTime();
    const free = lanes.findIndex((end) => end <= start);
    const lane = free === -1 ? lanes.length : free;

    lanes[lane] = Math.max(bar.end.getTime(), start + reach);
    bars.push(
      lane === 0 ? bar : { ...bar, resourceId: `${rowId}#${String(lane)}` },
    );
  }

  return { bars, count: lanes.length };
}
