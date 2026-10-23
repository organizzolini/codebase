import {
  clusterTimelineBars,
  getClusterSpan,
} from "./calendar-timeline-clusters";

import type { TimelineBar, TimelineRows } from "./calendar-timeline";
import type {
  GanttEvent,
  GanttResource,
  GanttScale,
} from "@codebase/presentation";

// 🔖 Type

/**
 * The timeline's rows and bars once the bars of a row that overlap have been
 * moved apart into lanes of their own.
 */
export interface TimelineLayout {
  bars: GanttEvent<TimelineBar>[];
  resources: GanttResource[];
}

// 🔖 Constants

/**
 * How many marker widths a marker holds its lane for at a day's scale, where
 * its title is drawn beside it.
 */
const LABELLED_REACH = 5;

// 🧩 Functions

/**
 * Lays one row's bars out as the timeline draws them at a scale and zoom:
 * the markers that would overlap gathered into counts, and the bars that
 * still overlap moved into lanes.
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
 * Moves the bars of each row that would overlap into lanes beneath it, so
 * that nothing is drawn over anything else. A bar goes in the first lane of
 * its row that is free by the time it starts; a bar shorter than `reach`
 * holds its lane that long, which keeps room for its marker and for the
 * title drawn beside it. A row that needs more than one lane gets a row for
 * each further lane, without a title, directly beneath it; a row that needs
 * one is left as it is, and a bar in a row it does not know stays where it
 * is.
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
 * Copies the rows with a row for each lane a row needs beyond its first,
 * placed straight after it. Walks the tree with a stack of its own rather
 * than recursion, keeping the call stack flat.
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
 * Puts each bar of a row, in order of start, in the first lane that is free
 * by then, and says how many lanes that took. A lane's first bar stays on the
 * row; the others move to the row of their lane.
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
