import {
  getRowOffsets,
  getVirtualWindow,
} from "../virtual-list/calendar-virtual-window.utilities";

import { TIMELINE_OVERSCAN } from "./calendar-timeline-window.constants";

import type {
  TimelineRowBox,
  TimelineViewport,
} from "./calendar-timeline-window.types";
import type { TimelineBar } from "./calendar-timeline.types";
import type { GanttEvent } from "@codebase/presentation";

/**
 * Ids of rows on screen plus a few beyond each edge; `null` until laid out, when every row counts as visible.
 */
export function getVisibleTimelineRows(
  rows: readonly TimelineRowBox[],
  viewport: TimelineViewport,
): null | ReadonlySet<string> {
  if (viewport.viewportHeight <= 0 || rows.length === 0) {
    return null;
  }

  const { end, start } = getVirtualWindow({
    offsets: getRowOffsets(rows.map((row) => row.height)),
    overscan: TIMELINE_OVERSCAN,
    scrollTop: viewport.scrollTop,
    viewportHeight: viewport.viewportHeight,
  });

  return new Set(rows.slice(start, end).map((row) => row.id));
}

/**
 * Whether two sets of visible rows hold the same ids, so a scroll that
 * reveals no new row draws nothing again.
 */
export function isSameRowSet(
  left: null | ReadonlySet<string>,
  right: null | ReadonlySet<string>,
): boolean {
  if (left === null || right === null) {
    return left === right;
  }

  return left.size === right.size && [...left].every((id) => right.has(id));
}

/**
 * Bars of the visible rows only, or every bar while all rows count as visible.
 */
export function windowTimelineBars(
  bars: GanttEvent<TimelineBar>[],
  visible: null | ReadonlySet<string>,
): GanttEvent<TimelineBar>[] {
  if (visible === null) {
    return bars;
  }

  return bars.filter((bar) => visible.has(bar.resourceId ?? ""));
}
