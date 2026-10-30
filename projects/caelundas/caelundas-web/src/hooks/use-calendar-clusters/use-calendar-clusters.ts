import { createElement, useCallback, useMemo, useState } from "react";

import { CalendarClusterDialog } from "../../components/calendar-cluster-dialog/calendar-cluster-dialog";
import { getViewWindows } from "../../components/events-calendar/calendar-window.utilities";

import { CLUSTER_ID_PREFIX } from "./calendar-clusters.constants";
import { clusterEvents } from "./calendar-clusters.utilities";
import {
  CLUSTER_TUNING,
  CLUSTERED_VIEWS,
} from "./use-calendar-clusters.constants";

import type {
  UseCalendarClustersProperties,
  UseCalendarClustersResult,
} from "./use-calendar-clusters.types";
import type { EventCalendarOccurrence } from "@codebase/presentation";

// 🧩 Hook

/**
 * Merges the events of one kind that run together in a week, three days or a
 * day, for the days that view shows, when merging is on, and holds which
 * cluster is open.
 */
export function useCalendarClusters(
  properties: Readonly<UseCalendarClustersProperties>,
): UseCalendarClustersResult {
  const {
    anchor,
    compact = false,
    enabled,
    events,
    timeZone,
    view,
  } = properties;

  // 🪝 Hooks
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

  // 🏗 Setup

  // 💪 Handlers
  const handleEventClick = useCallback(
    (occurrence: EventCalendarOccurrence) => {
      if (occurrence.eventId.startsWith(CLUSTER_ID_PREFIX)) {
        setOpenId(occurrence.eventId);
      }
    },
    [],
  );

  // ♻️ Lifecycle

  // 🎁 Result
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
