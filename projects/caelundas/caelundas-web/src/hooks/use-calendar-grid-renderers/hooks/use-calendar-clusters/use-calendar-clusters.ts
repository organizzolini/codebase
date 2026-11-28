import { useCallback, useMemo, useState } from "react";

import { toCalendarEvents } from "../../../../components/calendar-display/events-calendar/components/calendar-grid/calendar-grid.utilities";
import { addEdgeBlocks } from "../../../../components/calendar-display/events-calendar/components/calendar-grid/components/calendar-edges/calendar-edges.utilities";
import { createGroupOf } from "../../../../components/calendar-display/events-calendar/components/calendar-groups/calendar-groups.utilities";
import { getViewWindows } from "../../../../components/calendar-display/events-calendar/components/calendar-window/calendar-window.utilities";

import { CLUSTER_ID_PREFIX } from "./calendar-clusters.constants";
import { clusterEvents } from "./calendar-clusters.utilities";
import {
  CLUSTER_TUNING,
  CLUSTERED_VIEWS,
} from "./use-calendar-clusters.constants";

import type { CalendarEventRecord } from "../../../../components/calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type {
  UseCalendarClustersProperties,
  UseCalendarClustersResult,
} from "./use-calendar-clusters.types";
import type { EventCalendarOccurrence } from "@codebase/presentation";

// 🧩 Hook

/**
 * Marks where long events start and end, merges events of a group that run together, and holds open clusters.
 */
export function useCalendarClusters(
  properties: Readonly<UseCalendarClustersProperties>,
): UseCalendarClustersResult {
  const {
    anchor,
    compact = false,
    events,
    groupColors,
    grouping,
    roots,
    timeZone,
    view,
  } = properties;

  // 🪝 Hooks
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const groupOf = useMemo(
    () => createGroupOf(grouping, roots),
    [grouping, roots],
  );
  const clustered = useMemo(() => {
    // The days are UTC midnights standing for calendar days, so their ISO
    // dates are the days the view shows.
    const { visible } = getViewWindows(view, anchor);
    const enabled = CLUSTERED_VIEWS.has(view);
    const firstDay = visible.start.toISOString().slice(0, 10);
    const lastDay = new Date(visible.end.getTime() - 1)
      .toISOString()
      .slice(0, 10);
    const edges = enabled
      ? addEdgeBlocks(events, { firstDay, lastDay, timeZone })
      : { blocks: [], origins: new Map<string, CalendarEventRecord>() };
    const tuning =
      view === "day" || view === "week"
        ? CLUSTER_TUNING[compact ? "week" : view]
        : CLUSTER_TUNING.week;

    return {
      ...clusterEvents([...events, ...edges.blocks], {
        ...tuning,
        colors: groupColors,
        enabled,
        firstDay,
        groupOf,
        lastDay,
        timeZone,
      }),
      origins: edges.origins,
    };
  }, [anchor, compact, events, groupColors, groupOf, timeZone, view]);

  // 🏗 Setup
  const shown = useMemo(() => {
    const open: CalendarEventRecord[] = [];

    for (const id of expanded) {
      open.push(...(clustered.members.get(id) ?? []));
    }

    return [...clustered.events, ...open];
  }, [clustered, expanded]);
  // The month is drawn by the app, so the event calendar is handed none for it.
  const calendarEvents = useMemo(
    () =>
      toCalendarEvents(shown, {
        isMonth: view === "month",
        origins: clustered.origins,
      }),
    [clustered.origins, shown, view],
  );

  // 💪 Handlers
  const handleEventClick = useCallback(
    (occurrence: EventCalendarOccurrence) => {
      if (occurrence.eventId.startsWith(CLUSTER_ID_PREFIX)) {
        setExpanded((previous) => {
          const next = new Set(previous);

          if (!next.delete(occurrence.eventId)) {
            next.add(occurrence.eventId);
          }

          return next;
        });
      }
    },
    [],
  );

  // ♻️ Lifecycle

  // 🎁 Result
  return {
    calendarEvents,
    events: shown,
    expanded,
    groups: clustered.groups,
    handleEventClick,
    members: clustered.members,
    origins: clustered.origins,
  };
}
