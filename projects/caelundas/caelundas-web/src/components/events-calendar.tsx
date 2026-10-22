import { useCallback, useMemo } from "react";

import {
  EventCalendar,
  EventCalendarContent,
  type EventCalendarRenderEventProps,
} from "@codebase/presentation";

import { toCalendarEvent } from "../lib/calendar/calendar-events";
import { formatDuration } from "../lib/calendar/calendar-format";

import { CalendarToolbar } from "./calendar-toolbar";

import type { CalendarEventRecord } from "../lib/events-database/events-database.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The events to show, the day the calendar opens on, and the zone it renders
 * every time in.
 */
export interface EventsCalendarProperties {
  anchor: Date;
  className?: string;
  events: readonly CalendarEventRecord[];
  /**
   * Called with the new day when the toolbar moves the calendar.
   */
  onDateChange: (date: Date) => void;
  timeZone: string;
}

// 🧩 Component

/**
 * Renders the month view under a single toolbar row, filling its container.
 */
export function EventsCalendar(
  properties: Readonly<EventsCalendarProperties>,
): ReactNode {
  const { anchor, className, events, onDateChange, timeZone } = properties;

  // 🪝 Hooks
  const calendarEvents = useMemo(
    () => events.map((event) => toCalendarEvent(event)),
    [events],
  );
  const descriptions = useMemo(
    () => new Map(events.map((event) => [event.id, describeEvent(event)])),
    [events],
  );

  // 🏗 Setup

  // 💪 Handlers
  // A chip's own label carries only its title and time, so its tags and
  // duration are spelled out for screen readers inside it.
  const renderEvent = useCallback(
    (eventProperties: EventCalendarRenderEventProps<CalendarEventRecord>) => (
      <>
        <span className="truncate">
          {eventProperties.occurrence.event.title}
        </span>
        <span className="sr-only">
          {descriptions.get(eventProperties.occurrence.eventId)}
        </span>
      </>
    ),
    [descriptions],
  );

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="events-calendar"
    >
      <EventCalendar<CalendarEventRecord>
        className="h-full"
        date={anchor}
        events={calendarEvents}
        interactions={{ drag: false, resize: false, selectSlot: false }}
        onDateChange={onDateChange}
        renderEvent={renderEvent}
        timeZone={timeZone}
        view="month"
        views={["month"]}
      >
        <CalendarToolbar />
        <EventCalendarContent />
      </EventCalendar>
    </div>
  );
}

/**
 * Spells out an event's tag paths and its duration.
 */
function describeEvent(event: CalendarEventRecord): string {
  const tagPaths = event.tags.map((tag) => tag.path).join("; ");

  return `${tagPaths}. ${formatDuration(event.durationMinutes)}`;
}
