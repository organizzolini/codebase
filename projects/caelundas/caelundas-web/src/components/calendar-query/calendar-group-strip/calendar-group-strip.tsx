import { ListTree, Tags } from "lucide-react";
import { use, useMemo } from "react";

import {
  Button,
  ButtonGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import { TableGroupsContext } from "../../calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.constants";
import { QueryCascader } from "../query-cascader/query-cascader";
import { PICK_EVERY_ROW } from "../query-cascader/query-cascader.constants";

import {
  flattenGroupRuns,
  iconGroupRun,
  labelGroupRun,
  toGroupRuns,
  toRunLevels,
} from "./calendar-group-strip-runs.utilities";
import { COLOR_HINT, TITLE } from "./calendar-group-strip.constants";
import {
  createGroupItems,
  getCollapseHandlers,
  toGrouping,
  toGroupValue,
} from "./calendar-group-strip.utilities";
import { moveListItem } from "./components/chip-menu/chip-menu.utilities";
import { DEFAULT_GROUP_LABEL } from "./components/event-group-model/event-group-fields.constants";
import {
  createEventGroupFields,
  getDefaultGrouping,
} from "./components/event-group-model/event-group-fields.utilities";
import { GroupLevelChip } from "./components/group-level-chip/group-level-chip";

import type { EventFacet } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { EventGroupLevel } from "./components/event-group-model/event-groups.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The data's facets, the grouping shown, and the change handler.
 */
export interface CalendarGroupStripProperties {
  className?: string;
  facets: readonly EventFacet[];
  grouping: readonly EventGroupLevel[];
  /** Whether the link names no grouping, so one "Tags" chip stands for every root. */
  isDefaultGrouping?: boolean | undefined;
  onGroupingChange: (grouping: EventGroupLevel[]) => void;
  view: CalendarViewName;
}

// 🧩 Component

/** Renders the Group button, opening a searchable list to group by, joined to one chip per level. */
export function CalendarGroupStrip(
  properties: Readonly<CalendarGroupStripProperties>,
): ReactNode {
  const {
    className,
    facets,
    grouping: linked,
    isDefaultGrouping = false,
    onGroupingChange,
    view,
  } = properties;

  // 🪝 Hooks
  const fields = useMemo(() => createEventGroupFields(facets), [facets]);
  // The default stands for every tag root, so the first change edits that list.
  const grouping = useMemo(
    () => (isDefaultGrouping ? getDefaultGrouping("table", fields) : linked),
    [fields, isDefaultGrouping, linked],
  );

  // 🏗 Setup
  const items = useMemo(() => createGroupItems(fields), [fields]);
  const runs = useMemo(() => toGroupRuns(grouping), [grouping]);
  const tableGroups = use(TableGroupsContext);
  const runLevels = useMemo(() => toRunLevels(runs), [runs]);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  // The month, week and day have no rows to section, so the first group only colors their events.
  const hint = view === "table" || view === "timeline" ? undefined : COLOR_HINT;

  return (
    <div
      className={className}
      data-testid="calendar-group-strip"
    >
      <ButtonGroup
        aria-label={TITLE}
        className="flex-wrap gap-y-2"
        title={hint}
      >
        <Popover>
          <PopoverTrigger
            render={
              <Button
                size="sm"
                title={hint}
                variant="outline"
              >
                <ListTree aria-hidden="true" />
                {TITLE}
              </Button>
            }
          />
          <PopoverContent
            align="start"
            aria-label="Group by"
            className="w-80 max-w-[90vw] p-0"
          >
            <QueryCascader
              cascade={false}
              items={items}
              mode="tree"
              onValueChange={(next) => {
                onGroupingChange(toGrouping(next, grouping, fields));
              }}
              placeholder="Group by"
              selectable={PICK_EVERY_ROW}
              value={toGroupValue(grouping)}
              multiple
            />
          </PopoverContent>
        </Popover>
        {isDefaultGrouping ? (
          <GroupLevelChip
            icon={<Tags aria-hidden="true" />}
            label={DEFAULT_GROUP_LABEL}
            {...getCollapseHandlers(view, tableGroups, [...grouping.keys()])}
            onRemove={() => {
              onGroupingChange([]);
            }}
          />
        ) : null}
        {(isDefaultGrouping ? [] : runs).map((run, index) => (
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
            onRemove={() => {
              onGroupingChange(
                flattenGroupRuns(runs.filter((_other, at) => at !== index)),
              );
            }}
          />
        ))}
      </ButtonGroup>
    </div>
  );
}
