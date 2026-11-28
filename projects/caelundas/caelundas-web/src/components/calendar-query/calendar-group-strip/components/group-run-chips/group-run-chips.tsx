import { Tags } from "lucide-react";
import { Fragment, use } from "react";

import { TableGroupsContext } from "../../../../calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.constants";
import {
  flattenGroupRuns,
  iconGroupRun,
  labelGroupRun,
  pathGroupRun,
} from "../../calendar-group-strip-runs.utilities";
import { getCollapseHandlers } from "../../calendar-group-strip.utilities";
import { moveListItem } from "../chip-menu/chip-menu.utilities";
import { DEFAULT_GROUP_LABEL } from "../event-group-model/event-group-fields.constants";
import { GroupLevelChip } from "../group-level-chip/group-level-chip";

import type { CalendarViewName } from "../../../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { GroupRun } from "../../calendar-group-strip.types";
import type {
  EventGroupField,
  EventGroupLevel,
} from "../event-group-model/event-groups.types";
import type { ReactNode } from "react";

// 🔖 Type

/** The runs drawn as chips, their levels, and the change handler. */
export interface GroupRunChipsProperties {
  /**
   * The levels the one Tags chip stands for, when the link names no grouping.
   */
  defaultLevels: readonly number[];
  fields: readonly EventGroupField[];
  isDefaultGrouping: boolean;
  onGroupingChange: (grouping: EventGroupLevel[]) => void;
  /**
   * The levels of each run, in the runs' order.
   */
  runLevels: readonly (readonly number[])[];
  runs: readonly GroupRun[];
  view: CalendarViewName;
}

// 🧩 Component

/**
 * Renders the grouping as one chip per run, or as the one Tags chip when the link names none.
 */
export function GroupRunChips(
  properties: Readonly<GroupRunChipsProperties>,
): ReactNode {
  const {
    defaultLevels,
    fields,
    isDefaultGrouping,
    onGroupingChange,
    runLevels,
    runs,
    view,
  } = properties;

  // 🪝 Hooks
  const tableGroups = use(TableGroupsContext);

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (isDefaultGrouping) {
    return (
      <GroupLevelChip
        icon={<Tags aria-hidden="true" />}
        label={DEFAULT_GROUP_LABEL}
        {...getCollapseHandlers(view, tableGroups, defaultLevels)}
      />
    );
  }

  // 🎨 Markup
  return (
    <Fragment>
      {runs.map((run, index) => (
        <GroupLevelChip
          key={run.field}
          icon={iconGroupRun(run, fields)}
          label={labelGroupRun(run, fields)}
          {...getCollapseHandlers(view, tableGroups, runLevels[index] ?? [])}
          onMoveLeft={
            index === 0
              ? undefined
              : () => {
                  onGroupingChange(
                    flattenGroupRuns(moveListItem(runs, index, -1)),
                  );
                }
          }
          onMoveRight={
            index === runs.length - 1
              ? undefined
              : () => {
                  onGroupingChange(
                    flattenGroupRuns(moveListItem(runs, index, 1)),
                  );
                }
          }
          onOnly={
            runs.length === 1
              ? undefined
              : () => {
                  onGroupingChange(flattenGroupRuns([run]));
                }
          }
          onRemove={() => {
            onGroupingChange(
              flattenGroupRuns(runs.filter((_other, at) => at !== index)),
            );
          }}
          title={pathGroupRun(run, fields)}
        />
      ))}
    </Fragment>
  );
}
