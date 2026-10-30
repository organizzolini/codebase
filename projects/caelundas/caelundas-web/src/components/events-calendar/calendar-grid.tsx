import { useCallback, useMemo } from "react";

import { EventCalendar, EventCalendarContent } from "@codebase/presentation";

import { useCalendarClusters } from "../../hooks/use-calendar-clusters/use-calendar-clusters";
import { CalendarAgenda } from "../calendar-agenda/calendar-agenda";
import { getAgendaRange } from "../calendar-agenda/calendar-agenda.utilities";
import { CalendarEventChip } from "../calendar-event-chip/calendar-event-chip";
import { CalendarOverflowList } from "../calendar-overflow-list/calendar-overflow-list";

import { toCalendarEvent } from "./calendar-events.utilities";
import { describeEvent } from "./calendar-format.utilities";
import { CalendarGridNavigation } from "./calendar-grid-navigation";
import { AGENDA_DAY_COUNT } from "./calendar-views.constants";
import { toEventCalendarView } from "./calendar-views.utilities";
import { formatCalendarDate } from "./calendar-window.utilities";
import { NO_NATIVE_TOOLTIP } from "./events-calendar.constants";
import { getViewLayout } from "./events-calendar.utilities";

import type { EventGroupLevel } from "../calendar-group-by/event-groups.types";
import type { CalendarNavigation } from "../calendar-navigation-group/calendar-navigation-group.types";
import type { CalendarViewName } from "./calendar-views.types";
import type { CalendarEventRecord, EventFacet } from "./events-database.types";
import type { EventCalendarRenderEventProps } from "@codebase/presentation";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The events and view to draw, and where to report the calendar's moves.
 */
export interface CalendarGridProperties {
  /**
   * How many days the agenda lists; a month's worth when absent.
   */
  agendaDays?: number | undefined;
  anchor: Date;
  className?: string;
  /**
   * Whether the views of hours merge events that run together; on when
   * absent.
   */
  clusters?: boolean | undefined;
  compact: boolean;
  events: readonly CalendarEventRecord[];
  facets: readonly EventFacet[];
  grouping: readonly EventGroupLevel[];
  onDateChange: (date: Date) => void;
  onNavigationChange: (navigation: CalendarNavigation) => void;
  onShowLater?: (() => void) | undefined;
  timeZone: string;
  view: Exclude<CalendarViewName, "timeline">;
}

// 🧩 Component

/**
 * Renders every view but the timeline in the vendored event calendar, under
 * the toolbar it is handed.
 */
export function CalendarGrid(
  properties: Readonly<CalendarGridProperties>,
): ReactNode {
  const {
    agendaDays = AGENDA_DAY_COUNT,
    anchor,
    className,
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

  // 🪝 Hooks
  const clustered = useCalendarClusters({
    anchor,
    compact,
    enabled: clusters,
    events,
    timeZone,
    view,
  });
  const shown = clustered.events;
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

  // 🏗 Setup
  const calendarView = toEventCalendarView(view);
  const layout = getViewLayout(view, compact);

  // 💪 Handlers
  // A chip's label holds only title and time; its tags are spelled out inside.
  const renderEvent = useCallback(
    (eventProperties: EventCalendarRenderEventProps<CalendarEventRecord>) => {
      const { event, eventId } = eventProperties.occurrence;

      return event.data === undefined ? (
        event.title
      ) : (
        <CalendarEventChip
          description={descriptions.get(eventId)}
          event={event.data}
        />
      );
    },
    [descriptions],
  );
  // A busy day's "+N more" lists the whole day, as a windowed list, out of
  // every event loaded rather than only the ones its cell left out.
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
      data-testid="calendar-grid"
      style={{ display: "contents" }}
    >
      <EventCalendar<CalendarEventRecord>
        agendaDayCount={agendaDays}
        className="min-h-0 flex-1 [--ec-event-min-h:2.25rem]"
        classNames={layout.classNames}
        date={anchor}
        dayCount={calendarView.dayCount}
        events={calendarEvents}
        i18n={NO_NATIVE_TOOLTIP}
        interactions={{ drag: false, resize: false, selectSlot: false }}
        onDateChange={onDateChange}
        onEventClick={clustered.handleEventClick}
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
      {clustered.dialog}
    </div>
  );
}
