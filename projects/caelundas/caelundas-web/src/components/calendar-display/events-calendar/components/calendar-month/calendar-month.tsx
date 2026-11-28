import { useMemo } from "react";

import { formatCalendarDate } from "../calendar-window/calendar-window.utilities";

import { WEEKDAY_NAMES } from "./calendar-month.constants";
import { getMonthGrid, indexMonthEvents } from "./calendar-month.utilities";
import { CalendarMonthBand } from "./components/calendar-month-band/calendar-month-band";
import { CalendarMonthCell } from "./components/calendar-month-cell/calendar-month-cell";

import type { EventGrouping } from "../../../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { CalendarEventRecord } from "../calendar-loader/calendar-records.types";
import type { DayOpener } from "./calendar-month.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The events loaded around the month, and how to group them.
 */
export interface CalendarMonthProperties {
  anchor: Date;
  className?: string;
  events: readonly CalendarEventRecord[];
  groupColors: ReadonlyMap<string, string> | undefined;
  grouping: EventGrouping;
  onOpenDay?: DayOpener | undefined;
  timeZone: string;
}

// 🧩 Component

/**
 * Renders the month: an All month band under the weekday header, over week rows that grow with their cells.
 */
export function CalendarMonth(
  properties: Readonly<CalendarMonthProperties>,
): ReactNode {
  const {
    anchor,
    className,
    events,
    groupColors,
    grouping,
    onOpenDay,
    timeZone,
  } = properties;

  // 🪝 Hooks
  const grid = useMemo(() => getMonthGrid(anchor), [anchor]);
  const index = useMemo(
    () => indexMonthEvents(events, grid, timeZone),
    [events, grid, timeZone],
  );

  // 🏗 Setup
  const today = formatCalendarDate(new Date(), timeZone);
  const title = new Date(`${grid.firstDay}T12:00:00.000Z`).toLocaleDateString(
    "en-US",
    { month: "long", timeZone: "UTC", year: "numeric" },
  );

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      aria-label={title}
      className={`flex min-h-0 flex-1 flex-col overflow-auto border-t ${className ?? ""}`}
      data-slot="event-calendar-month-view"
      data-testid="calendar-month"
      role="grid"
    >
      <div className="bg-background/80 sticky top-0 z-20 backdrop-blur-sm">
        <div
          className="grid grid-cols-7 border-b"
          data-slot="event-calendar-month-header"
          role="row"
        >
          {WEEKDAY_NAMES.map((name) => (
            <div
              key={name}
              className="text-muted-foreground truncate px-2 py-1.5 font-medium"
              role="columnheader"
            >
              {name}
            </div>
          ))}
        </div>
        <CalendarMonthBand
          day={grid.firstDay}
          events={index.allMonth}
          groupColors={groupColors}
          grouping={grouping}
          timeZone={timeZone}
        />
      </div>
      {grid.weeks.map((week) => (
        <div
          key={week[0]}
          className="grid min-h-32 grid-cols-7 border-b last:border-b-0"
          data-slot="event-calendar-month-row"
          role="row"
        >
          {week.map((day) => (
            <CalendarMonthCell
              key={day}
              day={day}
              events={index.byDay.get(day) ?? []}
              groupColors={groupColors}
              grouping={grouping}
              isOutside={day < grid.firstDay || day > grid.lastDay}
              isToday={day === today}
              onOpenDay={onOpenDay}
              timeZone={timeZone}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
