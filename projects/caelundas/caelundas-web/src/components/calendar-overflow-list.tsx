import { useMemo } from "react";

import {
  AGENDA_ROW_HEIGHTS,
  getAgendaRange,
  toAgendaRows,
} from "../lib/calendar/calendar-agenda";
import { formatCalendarDay } from "../lib/calendar/calendar-format";

import { CalendarEventRow } from "./calendar-event-row";
import { VirtualList } from "./virtual-list";

import type { CalendarEventRecord } from "../lib/events-database/events-database.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * One busy day, and the events to pick out the ones on it from.
 */
export interface CalendarOverflowListProperties {
  className?: string;
  /**
   * The day as `YYYY-MM-DD` in the data's zone.
   */
  day: string;
  events: readonly CalendarEventRecord[];
  timeZone: string;
}

// 🧩 Component

/**
 * Renders the whole of a month cell's "+N more" day as a list that draws
 * only the rows on screen, so a day with hundreds of events opens at once.
 */
export function CalendarOverflowList(
  properties: Readonly<CalendarOverflowListProperties>,
): ReactNode {
  const { className, day, events, timeZone } = properties;

  // 🪝 Hooks
  // The day's events in order, each once, an event already under way when
  // the day began marked ongoing, the way the agenda lists them.
  const rows = useMemo(
    () =>
      toAgendaRows(events, getAgendaRange(day, timeZone, 1)).filter(
        (row) => row.kind === "event",
      ),
    [day, events, timeZone],
  );

  // 🏗 Setup
  const title = formatCalendarDay(day);

  // 💪 Handlers
  const renderRow = (row: (typeof rows)[number]): ReactNode => (
    <CalendarEventRow
      className="h-full"
      ongoing={row.ongoing}
      record={row.record}
      timeZone={timeZone}
    />
  );

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-overflow-list"
    >
      <p className="text-muted-foreground px-1 py-1 text-xs font-medium">
        {title}
      </p>
      <VirtualList
        className="h-64"
        getRowHeight={getEventRowHeight}
        getRowKey={getEventRowKey}
        label={`Events on ${title}`}
        renderRow={renderRow}
        rows={rows}
      />
    </div>
  );
}

/**
 * Every row of the list is one event's.
 */
function getEventRowHeight(): number {
  return AGENDA_ROW_HEIGHTS.event;
}

/**
 * Names a row by its event.
 */
function getEventRowKey(row: { record: CalendarEventRecord }): string {
  return row.record.id;
}
