import { formatCalendarDate } from "../../../../components/calendar-display/events-calendar/components/calendar-window/calendar-window.utilities";

import {
  CLUSTER_ID_PREFIX,
  CLUSTER_MINIMUM_MILLISECONDS,
  MINUTE_MILLISECONDS,
  NO_GROUP,
} from "./calendar-clusters.constants";

import type { CalendarGroupReference } from "../../../../components/calendar-display/events-calendar/components/calendar-groups/calendar-groups.types";
import type { CalendarEventRecord } from "../../../../components/calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type {
  ClusteredEvents,
  ClusterOptions,
} from "./calendar-clusters.types";

// 🌎 Public Functions

/**
 * Merges one group's events that start close together in a day into a counted stand-in; long events stay.
 */
export function clusterEvents(
  events: readonly CalendarEventRecord[],
  options: ClusterOptions,
): ClusteredEvents {
  if (!options.enabled) {
    return { events: [...events], groups: new Map(), members: new Map() };
  }

  // Named here, a frame above the runs, which keeps every stack beneath shallow.
  const groupsOf = new Map<CalendarEventRecord, CalendarGroupReference>();

  for (const event of events) {
    groupsOf.set(event, options.groupOf(event));
  }

  const { kept, runs } = collectRuns(events, { groupsOf, options });
  const { groups, members, merged } = mergeRuns(runs, options);

  return {
    events: [...kept, ...merged].toSorted(
      (left, right) => left.start.getTime() - right.start.getTime(),
    ),
    groups,
    members,
  };
}

// 🔏 Private Functions

/**
 * Sorts the events into the runs of one group and day, apart from those that stay as they are.
 */
function collectRuns(
  events: readonly CalendarEventRecord[],
  context: Readonly<{
    groupsOf: ReadonlyMap<CalendarEventRecord, CalendarGroupReference>;
    options: ClusterOptions;
  }>,
): {
  kept: CalendarEventRecord[];
  runs: Map<
    string,
    { events: CalendarEventRecord[]; group: CalendarGroupReference }
  >;
} {
  const { groupsOf, options } = context;
  const kept: CalendarEventRecord[] = [];
  const runs = new Map<
    string,
    { events: CalendarEventRecord[]; group: CalendarGroupReference }
  >();

  // Ordered once here, so every run is already in order of start. Loops
  // rather than mapping callbacks keep the call stacks shallow.
  for (const event of events.toSorted(
    (left, right) => left.start.getTime() - right.start.getTime(),
  )) {
    // An event with a date that is no time is left as it is, never thrown at.
    const isTime =
      Number.isFinite(event.start.getTime()) &&
      Number.isFinite(event.end.getTime());
    // Read here rather than by a helper, which would add a frame to every stack beneath.
    const startDay = isTime
      ? formatCalendarDate(event.start, options.timeZone)
      : "";
    const endDay = isTime
      ? formatCalendarDate(
          new Date(Math.max(event.start.getTime(), event.end.getTime() - 1)),
          options.timeZone,
        )
      : "";

    placeEvent({ kept, runs }, event, {
      day: getRunDay(startDay, endDay, options),
      group: groupsOf.get(event) ?? NO_GROUP,
    });
  }

  return { kept, runs };
}

/**
 * Stands one cluster in for its events: one short chip at the time they start, named for their group and count.
 */
function createStandIn(
  cluster: readonly CalendarEventRecord[],
  group: CalendarGroupReference,
  color: string | undefined,
): CalendarEventRecord {
  const [first] = cluster;

  if (first === undefined) {
    throw new Error("A cluster holds at least one event.");
  }

  const startTime = first.start.getTime();

  return {
    color: color ?? first.color,
    durationMinutes: Math.round(
      CLUSTER_MINIMUM_MILLISECONDS / MINUTE_MILLISECONDS,
    ),
    end: new Date(startTime + CLUSTER_MINIMUM_MILLISECONDS),
    groups: [],
    id: `${CLUSTER_ID_PREFIX}${first.id}`,
    name: `${String(cluster.length)} ${group.label}`,
    note: `${String(cluster.length)} events run together here.`,
    start: first.start,
    tags: [],
    timezone: first.timezone,
  };
}

/**
 * The day an event inside one day of the view falls on, else null.
 */
function getRunDay(
  startDay: string,
  endDay: string,
  options: ClusterOptions,
): null | string {
  return startDay !== "" &&
    startDay === endDay &&
    startDay >= options.firstDay &&
    startDay <= options.lastDay
    ? startDay
    : null;
}

/**
 * Splits each run into clusters and stands one in for every cluster of
 * more than one event, leaving a lone event as it is.
 */
function mergeRuns(
  runs: ReadonlyMap<
    string,
    { events: CalendarEventRecord[]; group: CalendarGroupReference }
  >,
  options: ClusterOptions,
): {
  groups: Map<string, CalendarGroupReference>;
  members: Map<string, readonly CalendarEventRecord[]>;
  merged: CalendarEventRecord[];
} {
  const groups = new Map<string, CalendarGroupReference>();
  const merged: CalendarEventRecord[] = [];
  const members = new Map<string, readonly CalendarEventRecord[]>();

  for (const run of runs.values()) {
    for (const cluster of splitRuns(
      run.events,
      options.gapMinutes * MINUTE_MILLISECONDS,
    )) {
      if (cluster.length < Math.max(2, options.minimum)) {
        merged.push(...cluster);
        continue;
      }

      const standIn = createStandIn(
        cluster,
        run.group,
        options.colors?.get(run.group.key ?? ""),
      );

      merged.push(standIn);
      groups.set(standIn.id, run.group);
      members.set(standIn.id, cluster);
    }
  }

  return { groups, members, merged };
}

/**
 * Puts an event in the run of its group and day, or apart when it has no day.
 */
function placeEvent(
  places: Readonly<{
    kept: CalendarEventRecord[];
    runs: Map<
      string,
      { events: CalendarEventRecord[]; group: CalendarGroupReference }
    >;
  }>,
  event: CalendarEventRecord,
  where: Readonly<{ day: null | string; group: CalendarGroupReference }>,
): void {
  const key = `${where.group.id}|${where.day ?? ""}`;
  const run = places.runs.get(key);

  if (where.day === null) {
    places.kept.push(event);
  } else if (run === undefined) {
    places.runs.set(key, { events: [event], group: where.group });
  } else {
    run.events.push(event);
  }
}

/**
 * Splits one group's events into runs starting within the gap of the run's first.
 */
function splitRuns(
  events: readonly CalendarEventRecord[],
  gapMilliseconds: number,
): CalendarEventRecord[][] {
  const runs: CalendarEventRecord[][] = [];
  let current: CalendarEventRecord[] = [];

  for (const event of events) {
    const [first] = current;

    if (
      first !== undefined &&
      event.start.getTime() - first.start.getTime() > gapMilliseconds
    ) {
      runs.push(current);
      current = [];
    }

    current.push(event);
  }

  if (current.length > 0) {
    runs.push(current);
  }

  return runs;
}
