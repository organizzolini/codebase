import { useCallback, useMemo } from "react";

import {
  EventCalendar,
  EventCalendarContent,
  type EventCalendarRenderEventProps,
} from "@codebase/presentation";

import { getAgendaRange } from "../lib/calendar/calendar-agenda";
import { toCalendarEvent } from "../lib/calendar/calendar-events";
import { describeEvent } from "../lib/calendar/calendar-format";
import {
  AGENDA_DAY_COUNT,
  type CalendarViewName,
  toEventCalendarView,
} from "../lib/calendar/calendar-views";
import { formatCalendarDate } from "../lib/calendar/calendar-window";

import { CalendarAgenda } from "./calendar-agenda";
import { CalendarOverflowList } from "./calendar-overflow-list";
import { CalendarToolbar } from "./calendar-toolbar";

import type { CalendarEventRecord } from "../lib/events-database/events-database.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The events to show, the day the calendar opens on, and the zone it renders
 * every time in.
 */
export interface EventsCalendarProperties {
  /**
   * How many days the agenda lists; a month's worth when absent.
   */
  agendaDays?: number | undefined;
  anchor: Date;
  className?: string;
  /**
   * Narrows the calendar for a phone: the toolbar lists the views in a menu,
   * and the week scrolls sideways under a sticky hour column.
   */
  compact?: boolean;
  events: readonly CalendarEventRecord[];
  /**
   * The filter controls the toolbar row carries.
   */
  filters?: ReactNode;
  /**
   * Called with the new day when the toolbar moves the calendar.
   */
  onDateChange: (date: Date) => void;
  /**
   * Called when the agenda should list more days; without it, it lists no
   * more.
   */
  onShowLater?: (() => void) | undefined;
  /**
   * Called with the view picked in the toolbar.
   */
  onViewChange?: (view: CalendarViewName) => void;
  timeZone: string;
  /**
   * The month when absent.
   */
  view?: CalendarViewName;
}

// A phone's week keeps each day wide enough to read, scrolling sideways in
// the content area while the hour column and the day headers stay put. Page
// scroll mode lets that area, rather than the grid's own inner scroller, do
// all the scrolling, so one element owns both axes.
// The "+N more" popover is widened to fit an event row's time and name.
const OVERFLOW_CLASS_NAMES = { morePopover: "w-80" };

// The hour column stacks above the event chips, which the calendar stacks
// from 10 up, and below the sticky day headers at 20.
const SCROLLING_WEEK_CLASS_NAMES = {
  timeGrid: "min-w-[48rem]",
  timeGutter: "bg-background sticky start-0 z-[15]",
};

// 🧩 Component

/**
 * Renders the view the page picked under a single toolbar row, filling its
 * container.
 */
export function EventsCalendar(
  properties: Readonly<EventsCalendarProperties>,
): ReactNode {
  const {
    agendaDays = AGENDA_DAY_COUNT,
    anchor,
    className,
    compact = false,
    events,
    filters,
    onDateChange,
    onShowLater,
    onViewChange,
    timeZone,
    view = "month",
  } = properties;

  // 🪝 Hooks
  const calendarEvents = useMemo(
    () => events.map((event) => toCalendarEvent(event)),
    [events],
  );
  const descriptions = useMemo(
    () => new Map(events.map((event) => [event.id, describeEvent(event)])),
    [events],
  );
  const agendaRange = useMemo(
    () =>
      getAgendaRange(
        formatCalendarDate(anchor, timeZone),
        timeZone,
        agendaDays,
      ),
    [agendaDays, anchor, timeZone],
  );

  // 🏗 Setup
  const calendarView = toEventCalendarView(view);
  const layout = getViewLayout(view, compact);

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
  // A busy day's "+N more" opens every event of the day as a windowed list.
  // The calendar hands over only the events its cell left out, so the list
  // picks the whole day out of every event loaded instead.
  const renderMoreContent = useCallback(
    (moreProperties: { day: Date }) => (
      <CalendarOverflowList
        day={formatCalendarDate(moreProperties.day, timeZone)}
        events={events}
        timeZone={timeZone}
      />
    ),
    [events, timeZone],
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
        agendaDayCount={agendaDays}
        className="h-full"
        classNames={layout.classNames}
        date={anchor}
        dayCount={calendarView.dayCount}
        events={calendarEvents}
        interactions={{ drag: false, resize: false, selectSlot: false }}
        onDateChange={onDateChange}
        renderEvent={renderEvent}
        renderMoreContent={renderMoreContent}
        scrollMode={layout.scrollMode}
        timeZone={timeZone}
        view={calendarView.view}
        views={[calendarView.view]}
      >
        <CalendarToolbar
          compact={compact}
          filters={filters}
          onViewChange={onViewChange}
          view={view}
        />
        <EventCalendarContent className={layout.contentClassName}>
          {view === "agenda" ? (
            <CalendarAgenda
              className="min-h-0 flex-1 border-t"
              events={events}
              onShowLater={onShowLater}
              range={agendaRange}
            />
          ) : undefined}
        </EventCalendarContent>
      </EventCalendar>
    </div>
  );
}

/**
 * How the calendar lays a view out: a phone's week scrolls sideways in the
 * content area under a sticky hour column, and every other view scrolls
 * inside itself.
 */
function getViewLayout(
  view: CalendarViewName,
  compact: boolean,
): {
  classNames: Record<string, string>;
  contentClassName: string | undefined;
  scrollMode: "contained" | "page";
} {
  return compact && view === "week"
    ? {
        classNames: SCROLLING_WEEK_CLASS_NAMES,
        contentClassName: "overflow-auto",
        scrollMode: "page",
      }
    : {
        classNames: OVERFLOW_CLASS_NAMES,
        contentClassName: undefined,
        scrollMode: "contained",
      };
}
