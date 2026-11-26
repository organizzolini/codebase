import { useMemo } from "react";

import { useCalendarNavigation } from "../../../hooks/use-calendar-navigation/use-calendar-navigation";
import { CalendarToolbar } from "../../calendar-controls/calendar-toolbar/calendar-toolbar";
import { createEventGroupFields } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-group-fields.utilities";
import { CalendarMetrics } from "../calendar-metrics/calendar-metrics";
import { CalendarTable } from "../calendar-table/calendar-table";
import { createGroupColors } from "../calendar-table/components/table-group-row/table-group-row.utilities";
import { CalendarTimeline } from "../calendar-timeline/calendar-timeline";

import { createColorScheme } from "./components/calendar-color-schemes/calendar-color-schemes.utilities";
import { colorEvents } from "./components/calendar-colors/calendar-colors.utilities";
import { CalendarGrid } from "./components/calendar-grid/calendar-grid";
import {
  OPAQUE_CLASS_NAMES,
  VENDORED_SURFACE_CLASS_NAMES,
} from "./components/calendar-views/calendar-surfaces.constants";
import { DEFAULT_TIMELINE_SCALE } from "./components/calendar-views/calendar-views.constants";
import { isMetricView } from "./components/calendar-views/calendar-views.utilities";
import { createDatePicker } from "./events-calendar.utilities";

import type { DateRangeValue } from "../../calendar-controls/calendar-date-picker/calendar-date-picker.types";
import type { EventFilterQuery } from "../../calendar-query/calendar-filters/components/event-filter-model/event-filters.types";
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
   * How many days the table lists; a month's worth when absent.
   */
  agendaDays?: number | undefined;
  anchor: Date;
  className?: string;
  /**
   * Whether events are drawn in color; they are when absent.
   */
  colors?: boolean;
  /**
   * The columns the table shows; its defaults when absent.
   */
  columns?: readonly string[] | undefined;
  /**
   * Narrows the calendar for a phone: the toolbar lists the views in a menu,
   * and the week scrolls sideways under a sticky hour column.
   */
  compact?: boolean;
  /**
   * Whether the metric layouts also measure the period before, to show the change; they do not when absent.
   */
  compare?: boolean;
  /**
   * The filter the metric layouts measure under; none when absent.
   */
  eventFilter?: EventFilterQuery | undefined;
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
   * The levels the table and timeline are sectioned by; the first colors events.
   */
  grouping: readonly EventGroupLevel[];
  /**
   * Whether groups with no events are left out; shown when absent.
   */
  hideEmpty?: boolean | undefined;
  /**
   * The metrics the metric layouts measure, first first; the Charts defaults when absent.
   */
  metrics?: readonly string[] | undefined;
  /**
   * Called with the table's new columns.
   */
  onColumnsChange?:
    | ((columns: readonly string[] | undefined) => void)
    | undefined;
  /**
   * Called with the new day when the toolbar moves the calendar.
   */
  onDateChange: (date: Date) => void;
  /**
   * Called with the days the toolbar's date picker applies; the title is plain text without it.
   */
  onRangeChange?: ((range: DateRangeValue) => void) | undefined;
  /**
   * Called with the table's new sorts.
   */
  onSortChange?: ((sort: GroupSort[] | undefined) => void) | undefined;
  /**
   * The span the timeline shows at once; a month when absent.
   */
  scale?: TimelineScale | undefined;
  /**
   * How the timeline orders its groups; as built when absent.
   */
  sort?: readonly GroupSort[] | undefined;
  timeZone: string;
  /**
   * The month when absent.
   */
  view?: CalendarViewName;
}

// 🧩 Component

/**
 * Renders one toolbar row over the picked view: the timeline as a Gantt, the table as rows, every other view in the event calendar.
 */
export function EventsCalendar(
  properties: Readonly<EventsCalendarProperties>,
): ReactNode {
  const {
    agendaDays,
    anchor,
    className,
    colors = true,
    columns,
    compact = false,
    events: loadedEvents,
    facets,
    filters,
    grouping,
    onColumnsChange,
    onDateChange,
    onSortChange,
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
    () => createColorScheme(grouping, fields),
    [fields, grouping],
  );
  const groupColors = useMemo(
    () => (colors ? createGroupColors(scheme.legend) : undefined),
    [colors, scheme],
  );
  const events = useMemo(
    () => colorEvents(loadedEvents, colors, scheme.colorOf),
    [colors, loadedEvents, scheme],
  );

  // 🏗 Setup
  const groups = { grouping, hideEmpty: properties.hideEmpty };
  // What every layout but the month's grid and the week's is handed alike.
  const shared = {
    anchor,
    onDateChange,
    onNavigationChange: handleNavigationChange,
    timeZone,
  };

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
        className={`flex h-full flex-col ${VENDORED_SURFACE_CLASS_NAMES.gridCells} ${OPAQUE_CLASS_NAMES.buttons} ${OPAQUE_CLASS_NAMES.events} ${OPAQUE_CLASS_NAMES.ganttBars} ${OPAQUE_CLASS_NAMES.labels} ${OPAQUE_CLASS_NAMES.pills}`}
      >
        <CalendarToolbar
          compact={compact}
          datePicker={createDatePicker({ ...properties, scale, view })}
          filters={filters}
          navigation={navigation}
        />
        {view === "table" ? (
          <CalendarTable
            {...shared}
            agendaDays={agendaDays}
            className="min-h-0 flex-1"
            columns={columns}
            events={events}
            facets={facets}
            groupColors={groupColors}
            {...groups}
            onColumnsChange={onColumnsChange}
            onSortChange={onSortChange}
            sort={sort}
          />
        ) : view === "timeline" ? (
          <CalendarTimeline
            {...shared}
            className="min-h-0 flex-1"
            compact={compact}
            events={events}
            facets={facets}
            groupColors={groupColors}
            {...groups}
            scale={scale}
            sort={sort}
          />
        ) : isMetricView(view) ? (
          <CalendarMetrics
            {...shared}
            agendaDays={agendaDays}
            className="min-h-0 flex-1"
            compare={properties.compare}
            filter={properties.eventFilter}
            groupColors={groupColors}
            {...groups}
            metrics={properties.metrics}
            onSortChange={onSortChange}
            sort={sort}
            view={view}
          />
        ) : (
          <CalendarGrid
            {...shared}
            compact={compact}
            events={events}
            view={view}
          />
        )}
      </div>
    </div>
  );
}
