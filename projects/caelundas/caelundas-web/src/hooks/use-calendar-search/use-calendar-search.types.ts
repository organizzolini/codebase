import type { DateRangeValue } from "../../components/calendar-controls/calendar-date-picker/calendar-date-picker.types";
import type {
  CalendarViewName,
  TimelineScale,
} from "../../components/calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { CalendarSymbols } from "../../components/calendar-events/event-glyphs/calendar-symbols.types";
import type { EventFilterQuery } from "../../components/calendar-query/calendar-filters/components/event-filter-model/event-filters.types";
import type { EventGrouping } from "../../components/calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { GroupSort } from "../../components/calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { CalendarSearch } from "./calendar-search.types";

// 🏷️ Types

/**
 * The ways the page writes a change to the link.
 */
export interface UseCalendarSearchResult {
  handleColorsChange: (enabled: boolean) => void;
  handleColumnsChange: (columns: readonly string[] | undefined) => void;
  handleCompareChange: (enabled: boolean) => void;
  handleDateChange: (date: Date) => void;
  handleFilterChange: (filter: EventFilterQuery) => void;
  handleFoldChange: (fold: string | undefined) => void;
  handleGroupingChange: (grouping: EventGrouping) => void;
  handleHideEmptyChange: (enabled: boolean) => void;
  handleMetricsChange: (metrics: readonly string[] | undefined) => void;
  handleRangeChange: (view: CalendarViewName, range: DateRangeValue) => void;
  handleScaleChange: (scale: TimelineScale) => void;
  handleSortChange: (sort: readonly GroupSort[] | undefined) => void;
  handleSymbolsChange: (symbols: CalendarSymbols) => void;
  handleViewChange: (view: CalendarViewName) => void;
  /**
   * Writes a change over the search the link already holds, pushing a new
   * entry unless `replace` is set.
   */
  updateSearch: (change: Partial<CalendarSearch>, replace?: boolean) => void;
}
