import { useContext } from "react";

import { CalendarSymbolsContext } from "../../hooks/use-calendar-search/calendar-symbols.constants";
import { getEventLabel } from "../event-glyphs/calendar-glyphs.utilities";
import { EventGlyphs } from "../event-glyphs/event-glyphs";
import { EventTagPills } from "../event-tag-pills/event-tag-pills";
import {
  formatDuration,
  formatEventSpan,
  formatEventTime,
} from "../events-calendar/calendar-format.utilities";

import type { CalendarEventRecord } from "../events-calendar/events-database.types";
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
 * its symbols, drawn as the symbols setting says, and name, and beneath that
 * its duration and tags, drawn as pills.
 */
export function CalendarEventRow(
  properties: Readonly<CalendarEventRowProperties>,
): ReactNode {
  const { className, ongoing = false, record, timeZone } = properties;

  // 🪝 Hooks
  const symbols = useContext(CalendarSymbolsContext);

  // 🏗 Setup
  const { glyphs, name } = getEventLabel(record);
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
        className="flex h-full items-center gap-3 border-b px-4 py-2"
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
          <span className="flex items-center gap-2 truncate text-sm font-medium">
            {glyphs === name ? null : (
              <span className="shrink-0 px-1 text-[1.5em] leading-none">
                {symbols === "glyphs" ? (
                  <EventGlyphs
                    glyphs={glyphs}
                    name={name}
                  />
                ) : (
                  glyphs
                )}
              </span>
            )}
            <span className="truncate">{name}</span>
          </span>
          <span className="text-muted-foreground truncate text-xs">
            {record.durationMinutes === 0
              ? formatDuration(record.durationMinutes)
              : `${formatEventSpan(record.start, record.end, timeZone)} · ${formatDuration(record.durationMinutes)}`}
          </span>
          <EventTagPills
            className="mt-1 min-w-0"
            tags={record.tags}
          />
        </span>
      </article>
    </div>
  );
}
