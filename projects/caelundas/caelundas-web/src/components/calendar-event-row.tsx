import {
  describeEvent,
  formatEventTime,
} from "../lib/calendar/calendar-format";

import type { CalendarEventRecord } from "../lib/events-database/events-database.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The event to show and the zone its time is read in.
 */
export interface CalendarEventRowProperties {
  className?: string;
  /**
   * Shows "Ongoing" in place of the time, for an event that began before
   * the first day a list shows.
   */
  ongoing?: boolean;
  record: CalendarEventRecord;
  timeZone: string;
}

// 🧩 Component

/**
 * Renders one event as a list row: its time in the data's zone, its color,
 * its name, and beneath that its tags and duration.
 */
export function CalendarEventRow(
  properties: Readonly<CalendarEventRowProperties>,
): ReactNode {
  const { className, ongoing = false, record, timeZone } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const time = ongoing ? "ongoing" : formatEventTime(record.start, timeZone);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-event-row"
    >
      <article
        aria-label={`${record.summary}, ${time}`}
        className="flex h-full items-center gap-3 border-b px-4"
      >
        <span className="text-muted-foreground w-20 shrink-0 text-xs tabular-nums">
          {ongoing ? "Ongoing" : time}
        </span>
        <span
          aria-hidden="true"
          className="bg-primary size-2 shrink-0 rounded-full"
          style={
            record.color === null ? undefined : { background: record.color }
          }
        />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">{record.summary}</span>
          <span className="text-muted-foreground truncate text-xs">
            {describeEvent(record)}
          </span>
        </span>
      </article>
    </div>
  );
}
