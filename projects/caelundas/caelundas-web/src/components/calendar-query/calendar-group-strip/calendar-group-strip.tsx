import { ListTree } from "lucide-react";
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
} from "./calendar-group-strip-runs.utilities";
import { TITLE } from "./calendar-group-strip.constants";
import {
  createGroupItems,
  getCollapseHandlers,
  toGrouping,
  toGroupValue,
} from "./calendar-group-strip.utilities";
import { moveListItem } from "./components/chip-menu/chip-menu.utilities";
import { createEventGroupFields } from "./components/event-group-model/event-group-fields.utilities";
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
  onGroupingChange: (grouping: EventGroupLevel[]) => void;
  view: CalendarViewName;
}

// 🧩 Component

/** Renders the Group button, opening a searchable list to group by, joined to one chip per level. */
export function CalendarGroupStrip(
  properties: Readonly<CalendarGroupStripProperties>,
): ReactNode {
  const { className, facets, grouping, onGroupingChange, view } = properties;

  // 🪝 Hooks
  const fields = useMemo(() => createEventGroupFields(facets), [facets]);

  // 🏗 Setup
  const items = useMemo(() => createGroupItems(fields), [fields]);
  const runs = useMemo(() => toGroupRuns(grouping), [grouping]);
  const collapse = getCollapseHandlers(view, use(TableGroupsContext));

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (view !== "agenda" && view !== "table" && view !== "timeline") {
    return null;
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-group-strip"
    >
      <ButtonGroup
        aria-label={TITLE}
        className="flex-wrap gap-y-2"
      >
        <Popover>
          <PopoverTrigger
            render={
              <Button
                size="sm"
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
        {runs.map((run, index) => (
          <GroupLevelChip
            key={run.field}
            icon={iconGroupRun(run, fields)}
            label={labelGroupRun(run, fields)}
            onCollapseAll={collapse.onCollapseAll}
            onExpandAll={collapse.onExpandAll}
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
