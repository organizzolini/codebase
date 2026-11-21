import type {
  CalendarViewName,
  TimelineScale,
} from "../../components/calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { CalendarSymbols } from "../../components/calendar-events/event-glyphs/calendar-symbols.types";
import type { EventFilterQuery } from "../../components/calendar-query/calendar-filters/components/event-filter-model/event-filters.types";
import type {
  EventGrouping,
  EventGroupLevel,
} from "../../components/calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { GroupSort } from "../../components/calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { CalendarSearch } from "./calendar-search.types";

// 🏷️ Types

/**
 * The ways the page writes a change to the link.
 */
export interface UseCalendarSearchResult {
  /**
   * Lists a month more of the agenda, writing it to the link; nothing once it lists a year.
   */
  getShowLater: (agendaDays: number) => (() => void) | undefined;
  handleClustersChange: (enabled: boolean) => void;
  handleColorByChange: (level: EventGroupLevel | undefined) => void;
  handleColorsChange: (enabled: boolean) => void;
  handleDateChange: (date: Date) => void;
  handleFilterChange: (filter: EventFilterQuery) => void;
  handleGroupingChange: (grouping: EventGrouping) => void;
  handleScaleChange: (scale: TimelineScale) => void;
  handleSortChange: (sort: GroupSort | undefined) => void;
  handleSymbolsChange: (symbols: CalendarSymbols) => void;
  handleViewChange: (view: CalendarViewName) => void;
  /**
   * Writes a change over the search the link already holds, pushing a new
   * entry unless `replace` is set.
   */
  updateSearch: (change: Partial<CalendarSearch>, replace?: boolean) => void;
}
