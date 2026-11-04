import {
  COLUMN_MINUTES,
  MARKER_REM,
  MINUTE_MILLISECONDS,
  PREVIEW_LENGTH,
  TIMELINE_UNIT_WIDTHS,
} from "./calendar-timeline-clusters.constants";

import type { CalendarEventRecord } from "../events-calendar/events-database.types";
import type { TimelineBar } from "./calendar-timeline.types";
import type { GanttEvent, GanttScale } from "@codebase/presentation";

/**
 * Gathers the markers of each row that would overlap into one bar counting
 * them, so thousands of crowded instants draw as a handful of counts. A
 * marker is an instant or a span too short to see at this scale; a run of
 * them starting within one marker's width of the run's first becomes a
 * cluster as long as that width, or as the run if longer. A lone marker and
 * every longer span are drawn as they are.
 */
export function clusterTimelineBars(
  bars: readonly GanttEvent<TimelineBar>[],
  span: number,
): GanttEvent<TimelineBar>[] {
  const drawn: GanttEvent<TimelineBar>[] = [];
  const markersByRow = new Map<string, GanttEvent<TimelineBar>[]>();

  for (const bar of bars) {
    if (bar.end.getTime() - bar.start.getTime() >= span) {
      drawn.push(bar);
    } else {
      const markers = markersByRow.get(bar.resourceId ?? "") ?? [];

      markers.push(bar);
      markersByRow.set(bar.resourceId ?? "", markers);
    }
  }

  for (const markers of markersByRow.values()) {
    drawn.push(...clusterRow(markers, span));
  }

  return drawn;
}

/**
 * How much time one marker's width covers at a scale and zoom, in
 * milliseconds: markers closer together than this would overlap, so they
 * are clustered.
 */
export function getClusterSpan(scale: GanttScale, zoom: number): number {
  return (
    ((MARKER_REM * COLUMN_MINUTES[scale]) /
      (TIMELINE_UNIT_WIDTHS[scale] * zoom)) *
    MINUTE_MILLISECONDS
  );
}

/**
 * Gathers one row's markers into runs, each starting within one marker's
 * width of its first, and draws each run as one bar.
 */
function clusterRow(
  markers: readonly GanttEvent<TimelineBar>[],
  span: number,
): GanttEvent<TimelineBar>[] {
  const runs: { end: number; markers: GanttEvent<TimelineBar>[] }[] = [];

  for (const marker of markers.toSorted(
    (left, right) => left.start.getTime() - right.start.getTime(),
  )) {
    let run = runs.at(-1);

    if (run === undefined || marker.start.getTime() >= run.end) {
      run = { end: marker.start.getTime() + span, markers: [] };
      runs.push(run);
    }

    run.markers.push(marker);
    run.end = Math.max(run.end, marker.end.getTime());
  }

  const drawn: GanttEvent<TimelineBar>[] = [];

  for (const run of runs) {
    const [first] = run.markers;

    if (first === undefined) {
      continue;
    }

    const data = collectRun(run.markers);

    drawn.push(
      toCluster(first, run.markers, {
        data,
        end: run.end,
        title: previewEvents(data.names),
      }),
    );
  }

  return drawn;
}

/**
 * Every name and record a run of markers holds, in order.
 */
function collectRun(run: readonly GanttEvent<TimelineBar>[]): TimelineBar {
  const names: string[] = [];
  const records: CalendarEventRecord[] = [];

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const marker of run) {
    names.push(...(marker.data?.names ?? []));
    records.push(...(marker.data?.records ?? []));
  }

  return { names, records };
}

/**
 * A cluster's title: its events' names, comma separated and cut short, with
 * how many more there are beyond those shown. The first name is always shown,
 * however long.
 */
function previewEvents(names: readonly string[]): string {
  let preview = "";
  let shown = 0;

  for (const name of names) {
    const next = shown === 0 ? name : `${preview}, ${name}`;

    if (shown > 0 && next.length > PREVIEW_LENGTH) {
      break;
    }

    preview = next;
    shown += 1;
  }

  const clipped =
    preview.length > PREVIEW_LENGTH
      ? `${preview.slice(0, PREVIEW_LENGTH - 1)}…`
      : preview;

  return shown < names.length
    ? `${clipped}, +${String(names.length - shown)}`
    : clipped;
}

/**
 * One bar for a run of markers, whose first is given apart: the marker
 * itself when it is alone, or a bar counting them that lasts until the run
 * ends, in the color of the first.
 */
function toCluster(
  first: GanttEvent<TimelineBar>,
  run: readonly GanttEvent<TimelineBar>[],
  bar: Readonly<{ data: TimelineBar; end: number; title: string }>,
): GanttEvent<TimelineBar> {
  const { data } = bar;

  if (run.length === 1) {
    return first;
  }

  return {
    data,
    end: new Date(bar.end),
    id: `${first.id}+${String(run.length)}`,
    readOnly: true,
    start: first.start,
    title: data.records.length === 0 ? "0 events" : bar.title,
    ...(first.color === undefined ? {} : { color: first.color }),
    ...(first.resourceId === undefined ? {} : { resourceId: first.resourceId }),
  };
}
