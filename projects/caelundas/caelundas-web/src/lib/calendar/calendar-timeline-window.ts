import { getRowOffsets, getVirtualWindow } from "./calendar-virtual-window";

import type { TimelineBar } from "./calendar-timeline";
import type { GanttEvent } from "@codebase/presentation";

/**
 * How many rows beyond each edge of the timeline's viewport keep their bars,
 * so a fast scroll does not show empty rows before the next render.
 */
const TIMELINE_OVERSCAN = 8;

/**
 * One timeline row as it was laid out: its id and its height in pixels, in
 * the order the rows are drawn.
 */
export interface TimelineRowBox {
  height: number;
  id: string;
}

/**
 * Where the timeline's body is scrolled to and how tall it shows.
 */
export interface TimelineViewport {
  scrollTop: number;
  viewportHeight: number;
}

/**
 * The ids of the rows on screen, and a few beyond each edge, or `null` while
 * the body has not been laid out and so every row counts as on screen.
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
 * The bars of the visible rows only, or every bar while every row counts as
 * visible: rows scrolled out of view draw nothing until they return.
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
