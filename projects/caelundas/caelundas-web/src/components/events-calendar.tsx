import { useCallback, useLayoutEffect, useMemo } from "react";

import {
  EventCalendar,
  EventCalendarContent,
  type EventCalendarRenderEventProps,
  useEventCalendarNavigation,
} from "@codebase/presentation";

import { getAgendaRange } from "../lib/calendar/calendar-agenda";
import { colorEvents } from "../lib/calendar/calendar-colors";
import { toCalendarEvent } from "../lib/calendar/calendar-events";
import { describeEvent } from "../lib/calendar/calendar-format";
import {
  AGENDA_DAY_COUNT,
  type CalendarViewName,
  DEFAULT_TIMELINE_SCALE,
  type TimelineScale,
  toEventCalendarView,
} from "../lib/calendar/calendar-views";
import { formatCalendarDate } from "../lib/calendar/calendar-window";

import { CalendarAgenda } from "./calendar-agenda";
import { CalendarOverflowList } from "./calendar-overflow-list";
import { CalendarTimeline } from "./calendar-timeline";
import { CalendarToolbar } from "./calendar-toolbar";
import { useCalendarClusters } from "./use-calendar-clusters";
import { useCalendarNavigation } from "./use-calendar-navigation";

import type { EventGroupLevel } from "../lib/event-groups/event-groups.types";
import type {
  CalendarEventRecord,
  EventFacet,
} from "../lib/events-database/events-database.types";
import type { CalendarNavigation } from "./calendar-navigation-group";
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
   * Whether the views of hours merge events of one kind that run together
   * into a single one with a count; they do when absent.
   */
  clusters?: boolean;
  /**
   * Whether events are drawn in the color of their kind; they are when
   * absent.
   */
  colors?: boolean;
  /**
   * Narrows the calendar for a phone: the toolbar lists the views in a menu,
   * and the week scrolls sideways under a sticky hour column.
   */
  compact?: boolean;
  events: readonly CalendarEventRecord[];
  /**
   * The tag roots the data has, which name the groups.
   */
  facets: readonly EventFacet[];
  /**
   * The filter controls the toolbar row carries.
   */
  filters?: ReactNode;
  /**
   * The levels the agenda is sectioned by, which the events' `groups` were
   * read for.
   */
  grouping: readonly EventGroupLevel[];
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
  /**
   * The span the timeline shows at once; a month when absent.
   */
  scale?: TimelineScale | undefined;
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
 * Renders a single toolbar row over the view the page picked, filling its
 * container: the timeline as a Gantt, every other view in the event
 * calendar.
 */
export function EventsCalendar(
  properties: Readonly<EventsCalendarProperties>,
): ReactNode {
  const {
    anchor,
    className,
    colors = true,
    compact = false,
    events: loadedEvents,
    facets,
    filters,
    grouping,
    onDateChange,
    onViewChange,
    scale = DEFAULT_TIMELINE_SCALE,
    timeZone,
    view = "month",
  } = properties;

  // 🪝 Hooks
  const { handleNavigationChange, navigation } = useCalendarNavigation(
    anchor,
    timeZone,
  );
  const events = useMemo(
    () => colorEvents(loadedEvents, colors),
    [colors, loadedEvents],
  );

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="events-calendar"
    >
      <div className="flex h-full flex-col">
        <CalendarToolbar
          compact={compact}
          filters={filters}
          navigation={navigation}
          onViewChange={onViewChange}
          view={view}
        />
        {view === "timeline" ? (
          <CalendarTimeline
            anchor={anchor}
            className="min-h-0 flex-1"
            compact={compact}
            events={events}
            facets={facets}
            grouping={grouping}
            onDateChange={onDateChange}
            onNavigationChange={handleNavigationChange}
            scale={scale}
            timeZone={timeZone}
          />
        ) : (
          <CalendarGrid
            {...properties}
            compact={compact}
            events={events}
            onNavigationChange={handleNavigationChange}
            view={view}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Renders every view but the timeline in the vendored event calendar, under
 * the toolbar it is handed.
 */
function CalendarGrid(
  properties: Readonly<
    EventsCalendarProperties & {
      compact: boolean;
      onNavigationChange: (navigation: CalendarNavigation) => void;
      view: Exclude<CalendarViewName, "timeline">;
    }
  >,
): ReactNode {
  const {
    agendaDays = AGENDA_DAY_COUNT,
    anchor,
    clusters = true,
    compact,
    events,
    facets,
    grouping,
    onDateChange,
    onNavigationChange,
    onShowLater,
    timeZone,
    view,
  } = properties;
  const {
    dialog,
    events: shown,
    handleEventClick,
  } = useCalendarClusters({
    anchor,
    enabled: clusters,
    events,
    timeZone,
    view,
  });
  const calendarEvents = useMemo(
    () => shown.map((event) => toCalendarEvent(event)),
    [shown],
  );
  const descriptions = useMemo(
    () => new Map(shown.map((event) => [event.id, describeEvent(event)])),
    [shown],
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
  const calendarView = toEventCalendarView(view);
  const layout = getViewLayout(view, compact);
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

  return (
    <>
      <EventCalendar<CalendarEventRecord>
        agendaDayCount={agendaDays}
        className="min-h-0 flex-1"
        classNames={layout.classNames}
        date={anchor}
        dayCount={calendarView.dayCount}
        events={calendarEvents}
        interactions={{ drag: false, resize: false, selectSlot: false }}
        onDateChange={onDateChange}
        onEventClick={handleEventClick}
        renderEvent={renderEvent}
        renderMoreContent={renderMoreContent}
        scrollMode={layout.scrollMode}
        timeZone={timeZone}
        view={calendarView.view}
        views={[calendarView.view]}
      >
        <CalendarGridNavigation onNavigationChange={onNavigationChange} />
        <EventCalendarContent className={layout.contentClassName}>
          {view === "agenda" ? (
            <CalendarAgenda
              className="min-h-0 flex-1 border-t"
              events={events}
              facets={facets}
              grouping={grouping}
              onShowLater={onShowLater}
              range={agendaRange}
            />
          ) : undefined}
        </EventCalendarContent>
      </EventCalendar>
      {dialog}
    </>
  );
}

/**
 * Reports the event calendar's own navigation, which only a child of the
 * calendar can read, to the toolbar above it, and draws nothing.
 */
function CalendarGridNavigation(
  properties: Readonly<{
    onNavigationChange: (navigation: CalendarNavigation) => void;
  }>,
): ReactNode {
  const { onNavigationChange } = properties;
  const navigation = useEventCalendarNavigation();

  // Before paint, so the toolbar never shows the title of the view before.
  // Every render reports, which ends there: the toolbar re-renders only when
  // the title it is handed differs.
  useLayoutEffect(() => {
    onNavigationChange(navigation);
  });

  return null;
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
