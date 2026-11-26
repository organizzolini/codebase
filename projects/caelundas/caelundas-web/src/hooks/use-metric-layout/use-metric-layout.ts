import { useEffect, useMemo } from "react";

import { sortMetricGroups } from "../../components/calendar-display/calendar-metrics/components/calendar-metrics-tree/calendar-metrics-tree.utilities";
import { createTableNavigation } from "../../components/calendar-display/calendar-table/calendar-table.utilities";
import { AGENDA_DAY_COUNT } from "../../components/calendar-display/events-calendar/components/calendar-views/calendar-views.constants";

import { useEventMetrics } from "./hooks/use-event-metrics/use-event-metrics";
import { useMetricExpansion } from "./hooks/use-metric-expansion/use-metric-expansion";
import { useMetricGroupRows } from "./hooks/use-metric-group-rows/use-metric-group-rows";
import {
  hideEmptyMetricGroups,
  keepShownTotals,
  listReadMetrics,
} from "./use-metric-layout.utilities";

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
    hideEmpty = false,
    onDateChange,
    onNavigationChange,
    rootsUntilTouched = false,
    sort,
    ...query
  } = options;
  const { agendaDays = AGENDA_DAY_COUNT, anchor, timeZone } = query;

  // 🪝 Hooks
  // A sort by a metric not shown still needs its numbers, so they are read too, and so does telling which groups are empty.
  const read = useMemo(
    () => listReadMetrics(query.metrics, { hideEmpty, sort }),
    [hideEmpty, query.metrics, sort],
  );
  const metrics = useEventMetrics({ ...query, metrics: read });
  // Every group, empty ones too: colors are shaped from these, so hiding some changes none.
  const colorGroups = useMemo(
    () => sortMetricGroups(metrics.data?.groups ?? [], sort),
    [metrics.data, sort],
  );
  const data = useMemo(
    () =>
      metrics.data === undefined
        ? undefined
        : {
            ...keepShownTotals(metrics.data, query.metrics),
            groups: hideEmpty
              ? hideEmptyMetricGroups(colorGroups)
              : colorGroups,
          },
    [colorGroups, hideEmpty, metrics.data, query.metrics],
  );

  const { expanded, open, toggle } = useMetricExpansion(
    data,
    rootsUntilTouched,
  );
  const { rows } = useMetricGroupRows(data, expanded);

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle
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
    colorGroups,
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
