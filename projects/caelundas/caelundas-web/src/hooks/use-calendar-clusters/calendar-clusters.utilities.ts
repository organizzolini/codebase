import { getEventKind } from "../../components/calendar-color-by/calendar-colors.utilities";
import { formatCalendarDate } from "../../components/events-calendar/calendar-window.utilities";

import {
  CLUSTER_ID_PREFIX,
  CLUSTER_MINIMUM_MILLISECONDS,
  CLUSTERED_KIND_PATHS,
  MINUTE_MILLISECONDS,
} from "./calendar-clusters.constants";

import type { CalendarEventRecord } from "../../components/events-calendar/calendar-records.types";
import type {
  ClusteredEvents,
  ClusterOptions,
} from "./calendar-clusters.types";

// 🌎 Public Functions

/**
 * Merges overlapping events of one kind into a stand-in with a count, so busy views stay legible.
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
 * Stands one cluster in for its events: one event, titled with their count and kind, over their span in the kind's color.
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
 * Names the run an event belongs to, per kind and day, or null when it is never merged.
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
 * Splits one kind's events, in start order, into runs that overlap, or that start within the gap for those inside a day.
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

    // Events past a day join while they overlap; those inside a day join while
    // they start within the gap of the cluster's first, so a cluster cannot stretch.
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
