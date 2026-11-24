import { use, useEffect, useMemo, useReducer } from "react";

import {
  listFirstPath,
  listGroupIds,
  listTableEvents,
  toListStats,
  toResetKey,
  toTableRows,
} from "../../components/calendar-display/calendar-table/calendar-table.utilities";
import {
  INITIAL_TABLE_GROUPS,
  TableGroupsContext,
} from "../../components/calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.constants";
import { reduceTableGroups } from "../../components/calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.utilities";
import { createTagRanks } from "../../components/calendar-query/calendar-group-strip/components/event-group-tree/event-group-sort.utilities";
import {
  buildEventGroups,
  sortEventGroups,
} from "../../components/calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.utilities";

import { ID_SEPARATOR } from "./use-table-rows.constants";

import type {
  UseTableRowsOptions,
  UseTableRowsResult,
} from "./use-table-rows.types";

// 🧩 Hook

/**
 * The table's rows, grouped, sorted and paged, with the handlers that open and close a group and show more of a list. Only the first path of groups is open at first, and a group that is not open adds just its header. The state of the groups and pages is the provider's when there is one, so the toolbar can change it, and the table's own otherwise; it starts over when the events, grouping, sort or days really change.
 */
export function useTableRows(
  options: Readonly<UseTableRowsOptions>,
): UseTableRowsResult {
  const { anchor, dayCount, events, facets, fields, grouping, sort, timeZone } =
    options;

  // 🪝 Hooks
  const shared = use(TableGroupsContext);
  const [own, dispatchOwn] = useReducer(
    reduceTableGroups,
    INITIAL_TABLE_GROUPS,
  );
  const { groups, idsKey, listed, pathKey, resetKey } = useMemo(() => {
    const inRange = listTableEvents({ anchor, dayCount, events, timeZone });
    const tree = sortEventGroups(
      buildEventGroups(inRange, grouping, fields),
      sort,
      createTagRanks(facets),
    );
    const ids = listGroupIds(tree).join(ID_SEPARATOR);

    return {
      groups: tree,
      idsKey: ids,
      listed: inRange,
      pathKey: listFirstPath(tree).join(ID_SEPARATOR),
      resetKey: toResetKey({
        anchor,
        dayCount,
        grouping,
        idsKey: ids,
        listed: inRange,
        sort,
        timeZone,
      }),
    };
  }, [anchor, dayCount, events, facets, fields, grouping, sort, timeZone]);
  // The ids as lists again, made anew only when they differ, so the reset below fires on a real change and not on every new array.
  const { firstPath, groupIds } = useMemo(
    () => ({
      firstPath: pathKey === "" ? [] : pathKey.split(ID_SEPARATOR),
      groupIds: idsKey === "" ? [] : idsKey.split(ID_SEPARATOR),
    }),
    [idsKey, pathKey],
  );

  // 🏗 Setup
  const { dispatch, state } = shared.provided
    ? shared
    : { dispatch: dispatchOwn, state: own };
  const rows = useMemo(
    () =>
      toTableRows(groups, listed, {
        expanded: state.expanded,
        limit: state.limit,
        limits: state.limits,
        pages: state.pages,
      }),
    [groups, listed, state.expanded, state.limit, state.limits, state.pages],
  );

  // 💪 Handlers
  const handlers = useMemo(
    () => ({
      more: (listId: string, shown: number) => {
        dispatch({ listId, shown, type: "more" });
      },
      toggle: (id: string) => {
        dispatch({ id, type: "toggle" });
      },
    }),
    [dispatch],
  );

  // ♻️ Lifecycle
  useEffect(() => {
    dispatch({ firstPath, groupIds, type: "reset" });
    // The key is the data by value; the ids come from the same data.
  }, [dispatch, firstPath, groupIds, resetKey]);
  useEffect(() => {
    dispatch({ stats: toListStats(groups, listed, rows), type: "set-stats" });
  }, [dispatch, groups, listed, rows]);

  // 🎁 Result
  return { more: handlers.more, rows, toggle: handlers.toggle };
}
