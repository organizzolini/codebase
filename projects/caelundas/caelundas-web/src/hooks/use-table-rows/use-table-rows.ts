import {
  use,
  useEffect,
  useMemo,
  useReducer,
  useRef as useReference,
} from "react";

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
  listGroupLevels,
  toListStats,
  toResetKey,
} from "../../components/calendar-display/calendar-table/table-groups.utilities";
import { pruneEmptyEventGroups } from "../../components/calendar-query/calendar-group-strip/components/event-group-tree/event-group-prune.utilities";
import {
  createTagRanks,
  sortListedEvents,
} from "../../components/calendar-query/calendar-group-strip/components/event-group-tree/event-group-sort.utilities";
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
  const {
    anchor,
    dayCount,
    events,
    facets,
    fields,
    grouping,
    hideEmpty = false,
    sort,
    timeZone,
  } = options;

  // 🪝 Hooks
  const shared = use(TableGroupsContext);
  const seenKey = useReference<null | string>(null);
  const [own, dispatchOwn] = useReducer(
    reduceTableGroups,
    INITIAL_TABLE_GROUPS,
  );
  const { groups, listed } = useMemo(() => {
    const inRange = listTableEvents({ anchor, dayCount, events, timeZone });
    const ranks = createTagRanks(facets);
    const sorted = sortEventGroups(
      buildEventGroups(inRange, grouping, fields),
      sort,
      ranks,
    );

    return {
      groups: hideEmpty ? pruneEmptyEventGroups(sorted) : sorted,
      listed: sortListedEvents(inRange, sort, ranks),
    };
  }, [
    anchor,
    dayCount,
    events,
    facets,
    fields,
    grouping,
    hideEmpty,
    sort,
    timeZone,
  ]);
  const { idsKey, levelsKey, pathKey, resetKey, tiersKey } = useMemo(() => {
    const ids = listGroupIds(groups).join(ID_SEPARATOR);

    return {
      idsKey: ids,
      levelsKey: grouping.map((level) => level.field).join("|"),
      pathKey: listFirstPath(groups).join(ID_SEPARATOR),
      resetKey: toResetKey({
        anchor,
        dayCount,
        grouping,
        idsKey: ids,
        listed,
        sort,
        timeZone,
      }),
      tiersKey: listGroupLevels(groups).join(ID_SEPARATOR),
    };
  }, [anchor, dayCount, grouping, groups, listed, sort, timeZone]);
  // The ids as lists again, made anew only when they differ, so the reset below fires on a real change and not on every new array.
  const { firstPath, groupIds, groupLevels, levelIcons } = useMemo(
    () => ({
      firstPath: pathKey === "" ? [] : pathKey.split(ID_SEPARATOR),
      groupIds: idsKey === "" ? [] : idsKey.split(ID_SEPARATOR),
      groupLevels:
        tiersKey === "" ? [] : tiersKey.split(ID_SEPARATOR).map(Number),
      levelIcons: getLevelIcons(levelsKey),
    }),
    [idsKey, levelsKey, pathKey, tiersKey],
  );

  // 🏗 Setup
  const { dispatch, state } = shared.provided
    ? shared
    : { dispatch: dispatchOwn, state: own };
  const rows = useMemo(
    () =>
      toTableRows(groups, listed, {
        expanded: state.expanded,
        isOrdered: true,
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
    // The table's first groups, or the same data again, keep what is open: a metric layout may have opened groups on these very ids.
    const isSameData = seenKey.current === null || seenKey.current === resetKey;

    seenKey.current = resetKey;
    dispatch({
      firstPath,
      groupIds,
      groupLevels,
      type: isSameData ? "register" : "reset",
    });
    // The key is the data by value; the ids come from the same data.
  }, [dispatch, firstPath, groupIds, groupLevels, resetKey, seenKey]);
  useEffect(() => {
    dispatch({ stats: toListStats(groups, listed, rows), type: "set-stats" });
  }, [dispatch, groups, listed, rows]);

  // 🎁 Result
  return { levelIcons, more: handlers.more, rows, toggle: handlers.toggle };
}
