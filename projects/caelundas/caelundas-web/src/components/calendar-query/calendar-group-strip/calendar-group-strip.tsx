import { ListTree } from "lucide-react";
import { useMemo } from "react";

import {
  Button,
  ButtonGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import { createEventGroupFields } from "../calendar-group-by/components/event-group-model/event-group-fields.utilities";
import { QueryCascader } from "../query-cascader/query-cascader";

import { STRIP_CLASS_NAME, TITLE } from "./calendar-group-strip.constants";
import {
  createGroupItems,
  labelGroupLevel,
  toGrouping,
  toGroupValue,
} from "./calendar-group-strip.utilities";
import { GroupLevelChip } from "./components/group-level-chip/group-level-chip";

import type { EventFacet } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { EventGroupLevel } from "../calendar-group-by/components/event-group-model/event-groups.types";
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

/**
 * Renders, for the agenda and timeline, the Group button, which opens a searchable, nested checklist of what to group by, with a tag root's tags beneath it, joined to one chip per level in order.
 */
export function CalendarGroupStrip(
  properties: Readonly<CalendarGroupStripProperties>,
): ReactNode {
  const { className, facets, grouping, onGroupingChange, view } = properties;

  // 🪝 Hooks
  const fields = useMemo(() => createEventGroupFields(facets), [facets]);

  // 🏗 Setup
  const items = useMemo(() => createGroupItems(fields), [fields]);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (view !== "agenda" && view !== "timeline") {
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
        className={STRIP_CLASS_NAME}
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
              items={items}
              onValueChange={(next) => {
                onGroupingChange(toGrouping(next, grouping, fields));
              }}
              placeholder="Group by"
              value={toGroupValue(grouping, fields)}
              multiple
            />
          </PopoverContent>
        </Popover>
        {grouping.map((level) => (
          <GroupLevelChip
            key={level.field}
            label={labelGroupLevel(level, fields)}
            onRemove={() => {
              onGroupingChange(
                grouping.filter((other) => other.field !== level.field),
              );
            }}
          />
        ))}
      </ButtonGroup>
    </div>
  );
}
