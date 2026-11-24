import { use, useEffect, useMemo, useReducer } from "react";

import {
  listTableEvents,
  toTableRows,
} from "../../components/calendar-display/calendar-table/calendar-table.utilities";
import {
  INITIAL_TABLE_GROUPS,
  TableGroupsContext,
} from "../../components/calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.constants";
import { reduceTableGroups } from "../../components/calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.utilities";
import {
  getLevelIcons,
  listFirstPath,
  listGroupIds,
  toListStats,
  toResetKey,
} from "../../components/calendar-display/calendar-table/table-groups.utilities";
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
 * The table's rows, grouped, sorted and paged, with handlers to open, close and load more; only the first path starts open.
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
  const { groups, idsKey, levelsKey, listed, pathKey, resetKey } =
    useMemo(() => {
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
        levelsKey: grouping.map((level) => level.field).join("|"),
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
  const { firstPath, groupIds, levelIcons } = useMemo(
    () => ({
      firstPath: pathKey === "" ? [] : pathKey.split(ID_SEPARATOR),
      groupIds: idsKey === "" ? [] : idsKey.split(ID_SEPARATOR),
      levelIcons: getLevelIcons(levelsKey),
    }),
    [idsKey, levelsKey, pathKey],
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
  return { levelIcons, more: handlers.more, rows, toggle: handlers.toggle };
}
