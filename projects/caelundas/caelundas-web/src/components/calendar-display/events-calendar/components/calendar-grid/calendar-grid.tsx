import { useMemo } from "react";

import { EventCalendar, EventCalendarContent } from "@codebase/presentation";

import { useCalendarClusters } from "../../../../../hooks/use-calendar-grid-renderers/hooks/use-calendar-clusters/use-calendar-clusters";
import { useCalendarGridRenderers } from "../../../../../hooks/use-calendar-grid-renderers/use-calendar-grid-renderers";
import { createTagRanks } from "../../../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-sort.utilities";
import { NO_NATIVE_TOOLTIP } from "../../events-calendar.constants";
import { getViewLayout } from "../../events-calendar.utilities";
import { CalendarGroupSortContext } from "../calendar-groups/calendar-groups.constants";
import { getRootOrder } from "../calendar-groups/calendar-groups.utilities";
import { CalendarMonth } from "../calendar-month/calendar-month";
import { toEventCalendarView } from "../calendar-views/calendar-views.utilities";

import { CalendarGridNavigation } from "./calendar-grid-navigation";

import type { CalendarNavigation } from "../../../../calendar-controls/calendar-navigation-group/calendar-navigation-group.types";
import type { EventGrouping } from "../../../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { GroupSort } from "../../../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type {
  CalendarEventRecord,
  EventFacet,
} from "../calendar-loader/calendar-records.types";
import type { DayOpener } from "../calendar-month/calendar-month.types";
import type { GridViewName } from "../calendar-views/calendar-views.types";
import type { AllDayMode } from "./components/calendar-all-day/calendar-all-day.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Events and view to draw, and a navigation reporter.
 */
export interface CalendarGridProperties {
  /**
   * How much of the week's all-day row shows; the groups when absent.
   */
  allDayMode?: AllDayMode | undefined;
  anchor: Date;
  className?: string;
  compact: boolean;
  events: readonly CalendarEventRecord[];
  /**
   * The tag roots, which rank groups sorted by a tag.
   */
  facets?: readonly EventFacet[] | undefined;
  groupColors?: ReadonlyMap<string, string> | undefined;
  /**
   * The levels whose first groups the busy cells; the default's when empty.
   */
  grouping?: EventGrouping;
  onAllDayModeChange?: ((mode: AllDayMode) => void) | undefined;
  onDateChange: (date: Date) => void;
  onNavigationChange: (navigation: CalendarNavigation) => void;
  /**
   * Opens the view below a day: the month's day opens its week, the week's its day.
   */
  onOpenDay?: DayOpener | undefined;
  /**
   * How the groups of a cell are ordered; by their tags' order when absent.
   */
  sort?: readonly GroupSort[] | undefined;
  timeZone: string;
  view: GridViewName;
}

// 🧩 Component

/**
 * Renders every view but the timeline in the vendored event calendar, under
 * the toolbar it is handed; the month is drawn by the app.
 */
export function CalendarGrid(
  properties: Readonly<CalendarGridProperties>,
): ReactNode {
  const {
    allDayMode = "grouped",
    anchor,
    className,
    compact,
    events,
    facets = [],
    groupColors,
    grouping = [],
    onAllDayModeChange,
    onDateChange,
    onNavigationChange,
    onOpenDay,
    sort,
    timeZone,
    view,
  } = properties;

  // 🪝 Hooks
  const roots = useMemo(() => getRootOrder(facets), [facets]);
  const groupSort = useMemo(
    () => ({ ranks: createTagRanks(facets), roots, sorts: sort }),
    [facets, roots, sort],
  );
  const clustered = useCalendarClusters({
    anchor,
    compact,
    events,
    groupColors,
    grouping,
    roots,
    timeZone,
    view,
  });
  const renderers = useCalendarGridRenderers({
    allDayMode,
    clustered,
    events,
    groupColors,
    grouping,
    onAllDayModeChange,
    onOpenDay,
    timeZone,
  });

  // 🏗 Setup
  const calendarView = toEventCalendarView(view);
  const layout = getViewLayout(view, compact);

  // 💪 Handlers

  // ♻️ Lifecycle
  // 🏁 Early Returns
  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-grid"
      style={{ display: "contents" }}
    >
      <CalendarGroupSortContext value={groupSort}>
        <EventCalendar<CalendarEventRecord>
          {...renderers}
          className="min-h-0 flex-1 [--ec-event-min-h:2.25rem]"
          classNames={layout.classNames}
          date={anchor}
          events={clustered.calendarEvents}
          i18n={NO_NATIVE_TOOLTIP}
          interactions={{ drag: false, resize: false, selectSlot: false }}
          onDateChange={onDateChange}
          onEventClick={clustered.handleEventClick}
          scrollMode={layout.scrollMode}
          timeZone={timeZone}
          view={calendarView}
          views={[calendarView]}
        >
          <CalendarGridNavigation onNavigationChange={onNavigationChange} />
          <EventCalendarContent className={layout.contentClassName}>
            {view === "month" ? (
              <CalendarMonth
                anchor={anchor}
                events={events}
                groupColors={groupColors}
                grouping={grouping}
                onOpenDay={onOpenDay}
                timeZone={timeZone}
              />
            ) : undefined}
          </EventCalendarContent>
        </EventCalendar>
      </CalendarGroupSortContext>
    </div>
  );
}
