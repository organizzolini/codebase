import { getEventKind } from "./calendar-colors";
import { formatCalendarDate } from "./calendar-window";

import type { CalendarEventRecord } from "../events-database/events-database.types";

// 🔖 Type

/**
 * The events a view draws once similar ones are merged, and what each
 * merged one stands for.
 */
export interface ClusteredEvents {
  /**
   * The events to draw: those that stay as they are and one stand-in for
   * each cluster.
   */
  events: CalendarEventRecord[];
  /**
   * The events behind each stand-in, by the stand-in's id.
   */
  members: ReadonlyMap<string, readonly CalendarEventRecord[]>;
}

/**
 * What decides which events are merged, and where.
 */
export interface ClusterOptions {
  enabled: boolean;
  /**
   * The first and last day the view shows, as `YYYY-MM-DD`.
   */
  firstDay: string;
  /**
   * How far apart, in minutes, two events inside a day may start and still
   * be one cluster. A view with room to draw many events side by side keeps
   * it short.
   */
  gapMinutes: number;
  lastDay: string;
  /**
   * The fewest events that make a cluster; fewer are left as they are, so a
   * view with room merges only what would crowd it.
   */
  minimum: number;
  timeZone: string;
}

// 🔖 Constants

/**
 * The id every stand-in for a cluster starts with.
 */
export const CLUSTER_ID_PREFIX = "cluster:";

/**
 * The kinds of event that are merged: the aspects, of which a busy day has
 * dozens that differ only in the bodies they join. Every other kind, such as
 * a twilight, a station or a cycle, is a different named event each time, and
 * is never merged.
 */
export const CLUSTERED_KIND_PATHS: ReadonlySet<string> = new Set([
  "Type / Aspect / Compound Aspect",
  "Type / Aspect / Simple Aspect / Major Aspect",
  "Type / Aspect / Simple Aspect / Minor Aspect",
  "Type / Aspect / Simple Aspect / Specialty Aspect",
]);

/**
 * The least span a cluster of instants is drawn with, so it has a body to
 * read.
 */
const CLUSTER_MINIMUM_MILLISECONDS = 30 * 60_000;

const MINUTE_MILLISECONDS = 60_000;

// 🧩 Functions

/**
 * Merges events of one kind that run together into a single stand-in with a
 * count, so a busy view stays legible: the events that run past a day, which
 * the calendar draws as bars above its hours, and those inside a day, which
 * it draws as chips on them. Events of one kind merge when they overlap, or
 * for those inside a day, start within the view's gap of the first of the
 * cluster; a kind
 * with one event in such a run keeps it as it is. Events outside the days
 * the view shows are left alone, so a count holds only what is on screen.
 */
export function clusterEvents(
  events: readonly CalendarEventRecord[],
  options: ClusterOptions,
): ClusteredEvents {
  if (!options.enabled) {
    return { events: [...events], members: new Map() };
  }

  const kept: CalendarEventRecord[] = [];
  const runs = new Map<string, CalendarEventRecord[]>();

  // Ordered once here, so every run is already in order of start. Loops
  // rather than mapping callbacks keep the call stacks shallow.
  for (const event of events.toSorted(
    (left, right) => left.start.getTime() - right.start.getTime(),
  )) {
    const key = getRunKey(event, options);
    const run = key === null ? undefined : runs.get(key);

    if (key === null) {
      kept.push(event);
    } else if (run === undefined) {
      runs.set(key, [event]);
    } else {
      run.push(event);
    }
  }

  const { members, merged } = mergeRuns(runs, options);

  return {
    events: [...kept, ...merged].toSorted(
      (left, right) => left.start.getTime() - right.start.getTime(),
    ),
    members,
  };
}

/**
 * Stands one cluster in for its events: one event, titled with their count
 * and the name of their kind, over the span they cover and in their kind's
 * color.
 */
function createStandIn(
  cluster: readonly CalendarEventRecord[],
  details: Readonly<{
    first: CalendarEventRecord;
    isLong: boolean;
    kindName: string;
  }>,
): CalendarEventRecord {
  const { first, isLong, kindName } = details;
  let startTime = first.start.getTime();
  let endTime = first.end.getTime();

  for (const event of cluster) {
    startTime = Math.min(startTime, event.start.getTime());
    endTime = Math.max(endTime, event.end.getTime());
  }

  // Events that run past a day are drawn as one bar over the span they cover.
  // Those inside a day are drawn as one short chip at the time they start, not
  // stretched over the hours the longest of them runs, which would read as one
  // long event.
  endTime = isLong
    ? Math.max(endTime, startTime + CLUSTER_MINIMUM_MILLISECONDS)
    : startTime + CLUSTER_MINIMUM_MILLISECONDS;

  return {
    color: first.color,
    description: `${String(cluster.length)} events run together here.`,
    durationMinutes: Math.round((endTime - startTime) / MINUTE_MILLISECONDS),
    end: new Date(endTime),
    groups: [],
    id: `${CLUSTER_ID_PREFIX}${first.id}`,
    location: null,
    start: new Date(startTime),
    summary: `${String(cluster.length)} ${kindName}`,
    tags: [],
    timezone: first.timezone,
  };
}

/**
 * Names the run an event belongs to, one for each kind of aspect and each day
 * inside which events are merged, and one more for each kind's events that run
 * past a day, or says it belongs to none: an event of a kind that is never
 * merged, or one outside the days the view shows.
 */
function getRunKey(
  event: CalendarEventRecord,
  options: ClusterOptions,
): null | string {
  const kind = getEventKind(event);

  if (kind === null || !CLUSTERED_KIND_PATHS.has(kind.path)) {
    return null;
  }

  const startDay = formatCalendarDate(event.start, options.timeZone);
  const endDay = formatCalendarDate(
    new Date(Math.max(event.start.getTime(), event.end.getTime() - 1)),
    options.timeZone,
  );

  if (endDay < options.firstDay || startDay > options.lastDay) {
    return null;
  }

  // Events that run past a day are merged apart from the ones inside it, and
  // the ones inside it day by day.
  return `${kind.path}|${startDay === endDay ? startDay : "long"}`;
}

/**
 * Splits each run into clusters and stands one in for every cluster of
 * more than one event, leaving a lone event as it is.
 */
function mergeRuns(
  runs: ReadonlyMap<string, readonly CalendarEventRecord[]>,
  options: ClusterOptions,
): {
  members: Map<string, readonly CalendarEventRecord[]>;
  merged: CalendarEventRecord[];
} {
  const merged: CalendarEventRecord[] = [];
  const members = new Map<string, readonly CalendarEventRecord[]>();

  for (const [key, run] of runs) {
    for (const cluster of splitRuns(
      run,
      key.endsWith("|long"),
      options.gapMinutes * MINUTE_MILLISECONDS,
    )) {
      const [first] = cluster;

      if (first === undefined) {
        continue;
      }

      if (cluster.length < Math.max(2, options.minimum)) {
        merged.push(...cluster);
        continue;
      }

      const kindLabel = getEventKind(first)?.label.toLowerCase() ?? "events";
      const standIn = createStandIn(cluster, {
        first,
        isLong: key.endsWith("|long"),
        kindName: kindLabel,
      });

      merged.push(standIn);
      members.set(standIn.id, cluster);
    }
  }

  return { members, merged };
}

/**
 * Splits events of one kind, already in order of start, into runs that
 * overlap, or for those inside a day, that start within the gap of the run's
 * end so far.
 */
function splitRuns(
  events: readonly CalendarEventRecord[],
  isLong: boolean,
  gapMilliseconds: number,
): CalendarEventRecord[][] {
  const runs: CalendarEventRecord[][] = [];
  let current: CalendarEventRecord[] = [];
  let reach = Number.NEGATIVE_INFINITY;

  for (const event of events) {
    const start = event.start.getTime();
    const [first] = current;

    // Events that run past a day join while they overlap, as a chain. Those
    // inside a day join only while they start within the gap of the first of
    // the cluster, never of one another, so a cluster cannot be stretched
    // across the day by events each close to the next.
    const joins =
      first === undefined ||
      (isLong
        ? start <= reach
        : start - first.start.getTime() <= gapMilliseconds);

    if (!joins) {
      runs.push(current);
      current = [];
      reach = Number.NEGATIVE_INFINITY;
    }

    current.push(event);
    reach = Math.max(reach, event.end.getTime());
  }

  if (current.length > 0) {
    runs.push(current);
  }

  return runs;
}
