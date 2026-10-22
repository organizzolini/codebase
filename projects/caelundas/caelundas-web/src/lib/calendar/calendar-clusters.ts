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
  lastDay: string;
  timeZone: string;
}

// 🔖 Constants

/**
 * The id every stand-in for a cluster starts with.
 */
export const CLUSTER_ID_PREFIX = "cluster:";

/**
 * How far apart two events of one kind may start and still be one cluster,
 * and the least span a cluster of instants is drawn with, so it has a body
 * to read.
 */
const CLUSTER_GAP_MILLISECONDS = 30 * 60_000;

const MINUTE_MILLISECONDS = 60_000;

// 🧩 Functions

/**
 * Merges events of one kind that run together into a single stand-in with a
 * count, so a busy view stays legible: the events that run past a day, which
 * the calendar draws as bars above its hours, and those inside a day, which
 * it draws as chips on them. Events of one kind merge when they overlap, or
 * for those inside a day, start within half an hour of one another; a kind
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

  // Ordered once here, so every run groupEvents makes is already in order.
  const { kept, runs } = groupEvents(
    events.toSorted(
      (left, right) => left.start.getTime() - right.start.getTime(),
    ),
    options,
  );
  const { members, merged } = mergeRuns(runs);

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
  first: CalendarEventRecord,
  kindName: string,
): CalendarEventRecord {
  let startTime = first.start.getTime();
  let endTime = first.end.getTime();

  for (const event of cluster) {
    startTime = Math.min(startTime, event.start.getTime());
    endTime = Math.max(endTime, event.end.getTime());
  }

  endTime = Math.max(endTime, startTime + CLUSTER_GAP_MILLISECONDS);

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
 * Sorts the events the view shows into runs, one for each kind and each day
 * inside which events are merged, with one more for each kind's events that
 * run past a day, and sets the events outside the days shown aside.
 */
function groupEvents(
  events: readonly CalendarEventRecord[],
  options: ClusterOptions,
): {
  kept: CalendarEventRecord[];
  runs: Map<string, CalendarEventRecord[]>;
} {
  const { firstDay, lastDay, timeZone } = options;
  const kept: CalendarEventRecord[] = [];
  const runs = new Map<string, CalendarEventRecord[]>();

  // Loops rather than mapping callbacks keep the call stacks shallow.
  for (const event of events) {
    const startDay = formatCalendarDate(event.start, timeZone);
    const endDay = formatCalendarDate(
      new Date(Math.max(event.start.getTime(), event.end.getTime() - 1)),
      timeZone,
    );

    if (endDay < firstDay || startDay > lastDay) {
      kept.push(event);
      continue;
    }

    // Events that run past a day are merged apart from the ones inside it,
    // and the ones inside it day by day.
    const key = `${getEventKind(event)?.path ?? ""}|${startDay === endDay ? startDay : "long"}`;
    const run = runs.get(key);

    if (run === undefined) {
      runs.set(key, [event]);
    } else {
      run.push(event);
    }
  }

  return { kept, runs };
}

/**
 * Splits each run into clusters and stands one in for every cluster of
 * more than one event, leaving a lone event as it is.
 */
function mergeRuns(runs: ReadonlyMap<string, readonly CalendarEventRecord[]>): {
  members: Map<string, readonly CalendarEventRecord[]>;
  merged: CalendarEventRecord[];
} {
  const merged: CalendarEventRecord[] = [];
  const members = new Map<string, readonly CalendarEventRecord[]>();

  for (const [key, run] of runs) {
    for (const cluster of splitRuns(run, key.endsWith("|long"))) {
      const [first] = cluster;

      if (first === undefined) {
        continue;
      }

      if (cluster.length === 1) {
        merged.push(first);
        continue;
      }

      const kindLabel = getEventKind(first)?.label.toLowerCase() ?? "events";
      const standIn = createStandIn(cluster, first, kindLabel);

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
): CalendarEventRecord[][] {
  const runs: CalendarEventRecord[][] = [];
  let current: CalendarEventRecord[] = [];
  let reach = Number.NEGATIVE_INFINITY;

  for (const event of events) {
    if (current.length > 0 && event.start.getTime() > reach) {
      runs.push(current);
      current = [];
    }

    current.push(event);
    reach = Math.max(
      current.length === 1 ? Number.NEGATIVE_INFINITY : reach,
      event.end.getTime() + (isLong ? 0 : CLUSTER_GAP_MILLISECONDS),
    );
  }

  if (current.length > 0) {
    runs.push(current);
  }

  return runs;
}
