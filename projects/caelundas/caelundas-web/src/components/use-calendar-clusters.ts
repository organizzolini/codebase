import { createElement, useCallback, useMemo, useState } from "react";

import {
  CLUSTER_ID_PREFIX,
  clusterEvents,
} from "../lib/calendar/calendar-clusters";
import { getViewWindows } from "../lib/calendar/calendar-window";

import { CalendarClusterDialog } from "./calendar-cluster-dialog";

import type { CalendarViewName } from "../lib/calendar/calendar-views";
import type { CalendarEventRecord } from "../lib/events-database/events-database.types";
import type { EventCalendarOccurrence } from "@codebase/presentation";
import type { ReactNode } from "react";

/**
 * What the views of hours draw instead of every event, how a click on a
 * cluster opens the events in it, and the dialog that lists them.
 */
export interface CalendarClusters {
  dialog: ReactNode;
  events: CalendarEventRecord[];
  handleEventClick: (occurrence: EventCalendarOccurrence) => void;
}

/**
 * The views that draw events on a grid of hours, where a busy day needs
 * merging: the month has its own "+N more", and the agenda and timeline list
 * and group.
 */
const CLUSTERED_VIEWS: ReadonlySet<CalendarViewName> = new Set([
  "day",
  "three-day",
  "week",
]);

/**
 * How readily each view merges: a day has room for many events side by side,
 * so it merges only a crowd, and a short gap apart; a week has seven narrow
 * columns, so it merges any two close events. A phone's one narrow column
 * merges as the week does.
 */
const CLUSTER_TUNING = {
  day: { gapMinutes: 10, minimum: 4 },
  "three-day": { gapMinutes: 20, minimum: 3 },
  week: { gapMinutes: 30, minimum: 2 },
} as const;

/**
 * Merges the events of one kind that run together in a week, three days or a
 * day, for the days that view shows, when merging is on, and holds which
 * cluster is open.
 */
export function useCalendarClusters(
  properties: Readonly<{
    anchor: Date;
    compact?: boolean | undefined;
    enabled: boolean;
    events: readonly CalendarEventRecord[];
    timeZone: string;
    view: CalendarViewName;
  }>,
): CalendarClusters {
  const {
    anchor,
    compact = false,
    enabled,
    events,
    timeZone,
    view,
  } = properties;
  const [openId, setOpenId] = useState<string | undefined>();
  const clustered = useMemo(() => {
    // The days are UTC midnights standing for calendar days, so their ISO
    // dates are the days the view shows.
    const { visible } = getViewWindows(view, anchor);

    const tuning =
      view === "day" || view === "three-day" || view === "week"
        ? CLUSTER_TUNING[compact ? "week" : view]
        : CLUSTER_TUNING.week;

    return clusterEvents(events, {
      ...tuning,
      enabled: enabled && CLUSTERED_VIEWS.has(view),
      firstDay: visible.start.toISOString().slice(0, 10),
      lastDay: new Date(visible.end.getTime() - 1).toISOString().slice(0, 10),
      timeZone,
    });
  }, [anchor, compact, enabled, events, timeZone, view]);
  const handleEventClick = useCallback(
    (occurrence: EventCalendarOccurrence) => {
      if (occurrence.eventId.startsWith(CLUSTER_ID_PREFIX)) {
        setOpenId(occurrence.eventId);
      }
    },
    [],
  );
  const open = openId === undefined ? undefined : clustered.members.get(openId);
  const dialog = createElement(CalendarClusterDialog, {
    members: open,
    onClose: () => {
      setOpenId(undefined);
    },
    timeZone,
    title: clustered.events.find((event) => event.id === openId)?.summary ?? "",
  });

  return { dialog, events: clustered.events, handleEventClick };
}
