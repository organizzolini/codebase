import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import { CalendarEventChip } from "../../../../../../calendar-events/calendar-event-chip/calendar-event-chip";
import { CalendarOverflowList } from "../../../../../../calendar-events/calendar-overflow-list/calendar-overflow-list";
import { NAME_TINT_PERCENT } from "../../../../../calendar-table/components/table-name-cell/table-name-cell.constants";
import { getNameTint } from "../../../../../calendar-table/components/table-name-cell/table-name-cell.utilities";
import {
  describeEvent,
  formatEventTime,
} from "../../../calendar-format/calendar-format.utilities";

import { GROUP_LIST_CAP } from "./calendar-group-list.constants";

import type { CalendarEventRecord } from "../../../calendar-loader/calendar-records.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The events of one open group on one day.
 */
export interface CalendarGroupListProperties {
  /**
   * How many events are listed before "+N more"; a lot when absent.
   */
  cap?: number | undefined;
  className?: string;
  /**
   * The day as `YYYY-MM-DD` in the data's zone.
   */
  day: string;
  events: readonly CalendarEventRecord[];
  /**
   * Whether each row starts with the event's time; it does when absent.
   */
  showTime?: boolean;
  timeZone: string;
}

// 🧩 Component

/**
 * Lists a group's events a row each, with +N more opening the rest past the cap.
 */
export function CalendarGroupList(
  properties: Readonly<CalendarGroupListProperties>,
): ReactNode {
  const {
    cap = GROUP_LIST_CAP,
    className,
    day,
    events,
    showTime = true,
    timeZone,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const shown = events.slice(0, cap);
  const hidden = events.length - shown.length;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <ul
      className={`mt-1 flex flex-col gap-1 ${className ?? ""}`}
      data-testid="calendar-group-list"
    >
      {shown.map((event) => (
        <li
          key={event.id}
          className="bg-background relative flex min-h-6 items-center gap-1.5 rounded-md border px-1.5 text-xs"
          style={getNameTint(event.color, NAME_TINT_PERCENT)}
        >
          {showTime ? (
            <span className="text-muted-foreground w-16 shrink-0 tabular-nums whitespace-nowrap">
              {formatEventTime(event.start, timeZone)}
            </span>
          ) : null}
          <CalendarEventChip
            description={describeEvent(event)}
            event={event}
          />
        </li>
      ))}
      {hidden > 0 ? (
        <li>
          <Popover>
            <PopoverTrigger
              render={
                <button
                  className="bg-muted text-foreground w-full cursor-pointer rounded-md border px-2 py-0.5 text-start text-xs"
                  type="button"
                />
              }
            >
              +{hidden} more
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-80"
            >
              <CalendarOverflowList
                day={day}
                events={events}
                timeZone={timeZone}
              />
            </PopoverContent>
          </Popover>
        </li>
      ) : null}
    </ul>
  );
}
