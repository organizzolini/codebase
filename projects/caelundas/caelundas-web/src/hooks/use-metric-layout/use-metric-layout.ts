import { useEffect, useMemo } from "react";

import {
  describeMetricGroups,
  sortMetricGroups,
} from "../../components/calendar-display/calendar-metrics/components/calendar-metrics-tree/calendar-metrics-tree.utilities";
import { createTableNavigation } from "../../components/calendar-display/calendar-table/calendar-table.utilities";
import { AGENDA_DAY_COUNT } from "../../components/calendar-display/events-calendar/components/calendar-views/calendar-views.constants";

import { useEventMetrics } from "./hooks/use-event-metrics/use-event-metrics";
import { useMetricExpansion } from "./hooks/use-metric-expansion/use-metric-expansion";
import { useMetricGroupRows } from "./hooks/use-metric-group-rows/use-metric-group-rows";

import type {
  UseMetricLayoutOptions,
  UseMetricLayoutResult,
} from "./use-metric-layout.types";

// 🧩 Hook

/**
 * Everything a metric layout needs: sorted metrics, the groups shown, the table's open groups, and the toolbar's navigation by days.
 */
export function useMetricLayout(
  options: Readonly<UseMetricLayoutOptions>,
): UseMetricLayoutResult {
  const {
    onDateChange,
    onNavigationChange,
    rootsUntilTouched = false,
    sort,
    ...query
  } = options;
  const { agendaDays = AGENDA_DAY_COUNT, anchor, timeZone } = query;

  // 🪝 Hooks
  const metrics = useEventMetrics(query);
  const data = useMemo(
    () =>
      metrics.data === undefined
        ? undefined
        : {
            ...metrics.data,
            groups: sortMetricGroups(metrics.data.groups, sort),
          },
    [metrics.data, sort],
  );
  const ids = useMemo(() => describeMetricGroups(data?.groups ?? []), [data]);

  const { dispatch, expanded, open, toggle } = useMetricExpansion(
    data,
    rootsUntilTouched,
  );
  const { rows } = useMetricGroupRows(data, expanded);

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle
  useEffect(() => {
    // Only the table's groups are known to it until a tree arrives; one on the same ids leaves what is open as it is.
    if (data !== undefined) {
      dispatch({ ...ids, type: "register" });
    }
  }, [data, dispatch, ids]);
  useEffect(() => {
    onNavigationChange(
      createTableNavigation({
        anchor,
        dayCount: agendaDays,
        onDateChange,
        timeZone,
      }),
    );
  }, [agendaDays, anchor, onDateChange, onNavigationChange, timeZone]);

  // 🎁 Result
  return {
    data,
    error: metrics.error,
    expanded,
    open,
    refetch: metrics.refetch,
    rows,
    status: metrics.status,
    toggle,
  };
}
