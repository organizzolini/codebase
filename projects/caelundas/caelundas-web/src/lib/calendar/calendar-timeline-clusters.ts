import type { CalendarEventRecord } from "../events-database/events-database.types";
import type { TimelineBar } from "./calendar-timeline";
import type { GanttEvent, GanttScale } from "@codebase/presentation";

const MINUTE_MILLISECONDS = 60_000;
const DAY_MINUTES = 1440;

/**
 * The width a marker takes on the axis, in rem: a circle is as wide as a
 * lane is tall, and a little more keeps neighbors from touching.
 */
const MARKER_REM = 1.5;

/**
 * How wide the timeline draws one column of each scale at rest, in rem,
 * which the timeline hands the Gantt so the clusters are sized by the same
 * widths it draws.
 */
export const TIMELINE_UNIT_WIDTHS: Readonly<Record<GanttScale, number>> = {
  day: 2.5,
  month: 4,
  quarter: 8,
  week: 10,
  year: 10,
};

/**
 * How many minutes each of a day's columns lasts: the fewest the Gantt
 * draws.
 */
export const TIMELINE_DAY_INTERVAL = 15;

/**
 * How long one column of each scale lasts, in minutes, as the Gantt lays its
 * axis out: the fifteen minutes the timeline asks of a day, a day in a week
 * or a month, a week in a quarter, and an average month in a year.
 */
const COLUMN_MINUTES: Readonly<Record<GanttScale, number>> = {
  day: TIMELINE_DAY_INTERVAL,
  month: DAY_MINUTES,
  quarter: 7 * DAY_MINUTES,
  week: DAY_MINUTES,
  year: 30.436_875 * DAY_MINUTES,
};

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
  const drawn: GanttEvent<TimelineBar>[] = [];
  let run: GanttEvent<TimelineBar>[] = [];
  let runEnd = Number.NEGATIVE_INFINITY;

  for (const marker of markers.toSorted(
    (left, right) => left.start.getTime() - right.start.getTime(),
  )) {
    const [first] = run;

    if (first !== undefined && marker.start.getTime() >= runEnd) {
      drawn.push(
        toCluster(first, run, { end: runEnd, title: previewEvents(run) }),
      );
      run = [];
    }

    if (run.length === 0) {
      runEnd = marker.start.getTime() + span;
    }

    run.push(marker);
    runEnd = Math.max(runEnd, marker.end.getTime());
  }

  const [first] = run;

  if (first !== undefined) {
    drawn.push(
      toCluster(first, run, { end: runEnd, title: previewEvents(run) }),
    );
  }

  return drawn;
}

/**
 * How many characters of the events' names a cluster's title shows.
 */
const PREVIEW_LENGTH = 28;

/**
 * A cluster's title: its events' names, comma separated and cut short, with
 * how many more there are beyond those shown.
 */
function previewEvents(run: readonly GanttEvent<TimelineBar>[]): string {
  const names: string[] = [];

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const marker of run) {
    names.push(...(marker.data?.names ?? []));
  }

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
  bar: Readonly<{ end: number; title: string }>,
): GanttEvent<TimelineBar> {
  if (run.length === 1) {
    return first;
  }

  const names: string[] = [];
  const records: CalendarEventRecord[] = [];

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const marker of run) {
    names.push(...(marker.data?.names ?? []));
    records.push(...(marker.data?.records ?? []));
  }

  return {
    data: { names, records },
    end: new Date(bar.end),
    id: `${first.id}+${String(run.length)}`,
    readOnly: true,
    start: first.start,
    title: records.length === 0 ? "0 events" : bar.title,
    ...(first.color === undefined ? {} : { color: first.color }),
    ...(first.resourceId === undefined ? {} : { resourceId: first.resourceId }),
  };
}
