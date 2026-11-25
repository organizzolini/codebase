import { use, useEffect, useMemo, useReducer } from "react";

import {
  INITIAL_TABLE_GROUPS,
  TableGroupsContext,
} from "../../../../components/calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.constants";
import { reduceTableGroups } from "../../../../components/calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.utilities";
import { getLevelIcons } from "../../../../components/calendar-display/calendar-table/table-groups.utilities";
import { createRowLabelRenderer } from "../../../../components/calendar-display/calendar-timeline/calendar-timeline.utilities";

import { ID_SEPARATOR } from "./use-timeline-groups.constants";
import {
  getCollapsedIds,
  getToggledIds,
  listTimelineGroups,
} from "./use-timeline-groups.utilities";

import type { TimelineRows } from "../../../../components/calendar-display/calendar-timeline/calendar-timeline.types";
import type { EventGroupLevel } from "../../../../components/calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { UseTimelineGroupsResult } from "./use-timeline-groups.types";

// 🧩 Hook

/**
 * Registers the timeline's groups with the shared state the chips act on, and closes the rows it says; the first path starts open.
 */
export function useTimelineGroups(
  rows: TimelineRows,
  grouping: readonly EventGroupLevel[],
): UseTimelineGroupsResult {
  // 🪝 Hooks
  const shared = use(TableGroupsContext);
  const [own, dispatchOwn] = useReducer(
    reduceTableGroups,
    INITIAL_TABLE_GROUPS,
  );
  const { idsKey, levelsKey, pathKey } = useMemo(() => {
    const list = listTimelineGroups(rows);

    return {
      idsKey: list.groupIds.join(ID_SEPARATOR),
      levelsKey: list.groupLevels.join(ID_SEPARATOR),
      pathKey: list.firstPath.join(ID_SEPARATOR),
    };
  }, [rows]);
  // The ids as lists again, made anew only when they differ, so the reset below fires on a real change and not on every new array.
  const { firstPath, groupIds, groupLevels } = useMemo(
    () => ({
      firstPath: pathKey === "" ? [] : pathKey.split(ID_SEPARATOR),
      groupIds: idsKey === "" ? [] : idsKey.split(ID_SEPARATOR),
      groupLevels:
        levelsKey === "" ? [] : levelsKey.split(ID_SEPARATOR).map(Number),
    }),
    [idsKey, levelsKey, pathKey],
  );

  // 🏗 Setup
  const { dispatch, state } = shared.provided
    ? shared
    : { dispatch: dispatchOwn, state: own };
  const collapsed = useMemo(
    () => getCollapsedIds(groupIds, state.expanded),
    [groupIds, state.expanded],
  );
  const fieldsKey = grouping.map((level) => level.field).join("|");
  const renderLabel = useMemo(
    () =>
      createRowLabelRenderer(rows.groups, getLevelIcons(fieldsKey), (id) => {
        dispatch({ id, type: "toggle" });
      }),
    [dispatch, fieldsKey, rows.groups],
  );

  // 💪 Handlers

  // ♻️ Lifecycle
  useEffect(() => {
    dispatch({ firstPath, groupIds, groupLevels, type: "reset" });
  }, [dispatch, firstPath, groupIds, groupLevels]);

  // 🎁 Result
  return {
    collapsedGroups: collapsed,
    onCollapsedGroupsChange: (ids) => {
      for (const id of getToggledIds(collapsed, ids)) {
        dispatch({ id, type: "toggle" });
      }
    },
    renderResourceLabel: renderLabel,
  };
}
