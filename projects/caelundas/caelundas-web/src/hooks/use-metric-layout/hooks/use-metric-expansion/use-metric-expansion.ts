import { use, useEffect, useReducer } from "react";

import { describeMetricGroups } from "../../../../components/calendar-display/calendar-metrics/components/calendar-metrics-tree/calendar-metrics-tree.utilities";
import {
  INITIAL_TABLE_GROUPS,
  TableGroupsContext,
} from "../../../../components/calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.constants";
import { reduceTableGroups } from "../../../../components/calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.utilities";
import { NONE_OPEN } from "../../use-metric-layout.constants";

import { toPickedGroup } from "./use-metric-expansion.utilities";

import type { EventMetricsData } from "../../../../components/calendar-display/calendar-metrics/calendar-metrics.types";
import type { UseMetricExpansionResult } from "./use-metric-expansion.types";

// 🧩 Hook

/**
 * Which groups a metric layout has open, shared with the table, and how it opens or closes one, naming it for the Group strip.
 */
export function useMetricExpansion(
  data: EventMetricsData | undefined,
  rootsUntilTouched: boolean,
): UseMetricExpansionResult {
  // 🪝 Hooks
  const shared = use(TableGroupsContext);
  const [own, dispatchOwn] = useReducer(
    reduceTableGroups,
    INITIAL_TABLE_GROUPS,
  );

  // 🏗 Setup
  const { dispatch, state } = shared.provided
    ? shared
    : { dispatch: dispatchOwn, state: own };
  // Until someone opens or closes a group, the state holds the table's lazy first path, which a chart would draw as dozens of bars.
  const base = rootsUntilTouched && !state.touched ? NONE_OPEN : undefined;
  const groups = data?.groups ?? [];

  // 💪 Handlers
  const open = (parent: string, id: string, color?: string): void => {
    const picked = toPickedGroup(groups, id, color);

    if (picked !== undefined) {
      dispatch({ base, ids: [parent, id], picked, type: "open" });
    }
  };
  const toggle = (id: string, color?: string): void => {
    dispatch({
      base,
      id,
      picked: toPickedGroup(groups, id, color),
      type: "toggle",
    });
  };

  // ♻️ Lifecycle
  useEffect(() => {
    // Only the table's groups are known to it until a tree arrives; one on the same ids leaves what is open as it is.
    if (data !== undefined) {
      dispatch({ ...describeMetricGroups(data.groups), type: "register" });
    }
  }, [data, dispatch]);

  // 🎁 Result
  return { expanded: base ?? state.expanded, open, toggle };
}
