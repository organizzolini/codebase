import { useMemo } from "react";

import { useCalendarNavigation } from "../../../hooks/use-calendar-navigation/use-calendar-navigation";
import { CalendarToolbar } from "../../calendar-controls/calendar-toolbar/calendar-toolbar";
import { createEventGroupFields } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-group-fields.utilities";
import { CalendarTimeline } from "../calendar-timeline/calendar-timeline";

import { createColorScheme } from "./components/calendar-color-schemes/calendar-color-schemes.utilities";
import { colorEvents } from "./components/calendar-colors/calendar-colors.utilities";
import { CalendarGrid } from "./components/calendar-grid/calendar-grid";
import {
  OPAQUE_CLASS_NAMES,
  VENDORED_SURFACE_CLASS_NAMES,
} from "./components/calendar-views/calendar-surfaces.constants";
import { DEFAULT_TIMELINE_SCALE } from "./components/calendar-views/calendar-views.constants";

import type { EventGroupLevel } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { GroupSort } from "../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type {
  CalendarEventRecord,
  EventFacet,
} from "./components/calendar-loader/calendar-records.types";
import type {
  CalendarViewName,
  TimelineScale,
} from "./components/calendar-views/calendar-views.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The events, opening day, and display zone.
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
   * What the events are colored by, whose keys follow the grouping's levels
   * in each event's `groups`; the color of their kind when absent.
   */
  colorBy?: EventGroupLevel | undefined;
  /**
   * Whether events are drawn in color; they are when absent.
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
   * The filter controls the toolbar's second row carries.
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
   * The span the timeline shows at once; a month when absent.
   */
  scale?: TimelineScale | undefined;
  /**
   * How the timeline orders its groups; as built when absent.
   */
  sort?: GroupSort | undefined;
  timeZone: string;
  /**
   * The month when absent.
   */
  view?: CalendarViewName;
}

// 🧩 Component

/**
 * Renders one toolbar row over the picked view: the timeline as a Gantt, every other view in the event calendar.
 */
export function EventsCalendar(
  properties: Readonly<EventsCalendarProperties>,
): ReactNode {
  const {
    agendaDays,
    anchor,
    className,
    colorBy,
    colors = true,
    compact = false,
    events: loadedEvents,
    facets,
    filters,
    grouping,
    onDateChange,
    scale = DEFAULT_TIMELINE_SCALE,
    sort,
    timeZone,
    view = "month",
  } = properties;

  // 🪝 Hooks
  const { handleNavigationChange, navigation } = useCalendarNavigation({
    agendaDays,
    anchor,
    scale,
    timeZone,
    view,
  });
  const fields = useMemo(() => createEventGroupFields(facets), [facets]);
  const scheme = useMemo(
    () => createColorScheme(colorBy, fields, grouping.length),
    [colorBy, fields, grouping.length],
  );
  const events = useMemo(
    () => colorEvents(loadedEvents, colors, scheme.colorOf),
    [colors, loadedEvents, scheme],
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
      <div
        className={`flex h-full flex-col ${VENDORED_SURFACE_CLASS_NAMES.gridCells} ${OPAQUE_CLASS_NAMES.buttons} ${OPAQUE_CLASS_NAMES.events} ${OPAQUE_CLASS_NAMES.ganttBars} ${OPAQUE_CLASS_NAMES.labels}`}
      >
        <CalendarToolbar
          compact={compact}
          filters={filters}
          navigation={navigation}
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
            sort={sort}
            timeZone={timeZone}
          />
        ) : (
          <CalendarGrid
            agendaDays={agendaDays}
            anchor={anchor}
            clusters={properties.clusters}
            compact={compact}
            events={events}
            facets={facets}
            grouping={grouping}
            onDateChange={onDateChange}
            onNavigationChange={handleNavigationChange}
            onShowLater={properties.onShowLater}
            timeZone={timeZone}
            view={view}
          />
        )}
      </div>
    </div>
  );
}
