import { ListTree } from "lucide-react";
import { useMemo } from "react";

import {
  Button,
  ButtonGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import { useStripLines } from "../../../hooks/use-strip-lines/use-strip-lines";
import { BUTTON_STRIP_CLASS_NAME } from "../../../hooks/use-strip-lines/use-strip-lines.constants";
import { QueryCascader } from "../query-cascader/query-cascader";
import { PICK_EVERY_ROW } from "../query-cascader/query-cascader.constants";

import {
  toGroupRuns,
  toRunLevels,
} from "./calendar-group-strip-runs.utilities";
import { TITLE } from "./calendar-group-strip.constants";
import {
  createGroupItems,
  getGroupHint,
  toGrouping,
  toGroupValue,
} from "./calendar-group-strip.utilities";
import {
  createEventGroupFields,
  getDefaultGrouping,
  getRootGrouping,
} from "./components/event-group-model/event-group-fields.utilities";
import { GroupRunChips } from "./components/group-run-chips/group-run-chips";
import { PickedGroupChips } from "./components/picked-group-chips/picked-group-chips";

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
  /** Whether the link names no grouping, so one "Tags" chip, which stays, stands for every root. */
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
  const { reference } = useStripLines();
  const fields = useMemo(() => createEventGroupFields(facets), [facets]);
  // The default's menu ticks every tag root, so a change edits that list; its chip opens the levels it draws.
  const { defaultLevels, grouping } = useMemo(
    () => ({
      defaultLevels: [...getDefaultGrouping(fields).keys()],
      grouping: isDefaultGrouping ? getRootGrouping(fields) : linked,
    }),
    [fields, isDefaultGrouping, linked],
  );

  // 🏗 Setup
  const items = useMemo(() => createGroupItems(fields), [fields]);
  const { runLevels, runs } = useMemo(() => {
    const grouped = toGroupRuns(grouping);

    return { runLevels: toRunLevels(grouped), runs: grouped };
  }, [grouping]);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  const hint = getGroupHint(view);

  return (
    <div
      className={className}
      data-testid="calendar-group-strip"
    >
      <ButtonGroup
        ref={reference}
        aria-label={TITLE}
        className={BUTTON_STRIP_CLASS_NAME}
        data-strip-buttons=""
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
        <GroupRunChips
          defaultLevels={defaultLevels}
          fields={fields}
          isDefaultGrouping={isDefaultGrouping}
          onGroupingChange={onGroupingChange}
          runLevels={runLevels}
          runs={runs}
          view={view}
        />
        <PickedGroupChips view={view} />
      </ButtonGroup>
    </div>
  );
}
