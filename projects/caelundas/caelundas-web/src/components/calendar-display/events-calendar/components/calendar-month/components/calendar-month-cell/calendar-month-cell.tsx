import { use, useMemo } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import { CalendarOverflowList } from "../../../../../../calendar-events/calendar-overflow-list/calendar-overflow-list";
import { CalendarDayLink } from "../../../calendar-day-link/calendar-day-link";
import { CalendarOpenGroups } from "../../../calendar-group-chip/components/calendar-open-groups/calendar-open-groups";
import { CalendarGroupSortContext } from "../../../calendar-groups/calendar-groups.constants";
import { groupCalendarEvents } from "../../../calendar-groups/calendar-groups.utilities";
import { MONTH_GROUP_CAP } from "../../calendar-month.constants";

import type { EventGrouping } from "../../../../../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { CalendarEventRecord } from "../../../calendar-loader/calendar-records.types";
import type { DayOpener } from "../../calendar-month.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * One day of the month: its events and whether it is today.
 */
export interface CalendarMonthCellProperties {
  className?: string;
  day: string;
  events: readonly CalendarEventRecord[];
  groupColors: ReadonlyMap<string, string> | undefined;
  grouping: EventGrouping;
  isOutside: boolean;
  isToday: boolean;
  onOpenDay?: DayOpener | undefined;
  timeZone: string;
}

// 🧩 Component

/**
 * Renders a day cell: its number, which alone opens its week, and its events as groups that open in place.
 */
export function CalendarMonthCell(
  properties: Readonly<CalendarMonthCellProperties>,
): ReactNode {
  const {
    className = "",
    day,
    events,
    groupColors,
    grouping,
    isOutside,
    isToday,
    onOpenDay,
    timeZone,
  } = properties;

  // 🪝 Hooks
  const { ranks, roots, sorts } = use(CalendarGroupSortContext);
  const groups = useMemo(
    () =>
      groupCalendarEvents(events, {
        colors: groupColors,
        grouping,
        ranks,
        roots,
        sorts,
      }),
    [events, groupColors, grouping, ranks, roots, sorts],
  );

  // 🏗 Setup
  const hidden = groups.length - MONTH_GROUP_CAP;
  const number = (
    <span
      className={`flex size-5 items-center justify-center rounded-full text-xs ${isToday ? "bg-primary text-primary-foreground font-light" : ""}`}
      data-slot="event-calendar-month-day-number"
    >
      {Number(day.slice(8))}
    </span>
  );

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={`${className} ${isOutside ? "opacity-60" : ""} flex min-w-0 flex-col gap-0.5 border-e p-1 last:border-e-0`}
      data-day={day}
      data-testid="calendar-month-cell"
      data-today={isToday || undefined}
      role="gridcell"
    >
      <div className="flex justify-end">
        {onOpenDay === undefined ? (
          number
        ) : (
          <CalendarDayLink
            day={day}
            label={`Open the week of ${day}`}
            level="month"
            onOpen={() => {
              onOpenDay("week", day);
            }}
            onOpenDay={onOpenDay}
          >
            {number}
          </CalendarDayLink>
        )}
      </div>
      <CalendarOpenGroups
        day={day}
        groups={groups.slice(0, MONTH_GROUP_CAP)}
        timeZone={timeZone}
      />
      {hidden > 0 ? (
        <Popover>
          <PopoverTrigger
            render={
              <button
                className="bg-muted text-foreground w-full cursor-pointer rounded-md border px-2 py-0.5 text-start text-xs"
                type="button"
              />
            }
          >
            +{hidden} more groups
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
      ) : null}
    </div>
  );
}
