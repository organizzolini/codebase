import type { CalendarSearch } from "../../types/calendar-search.types";
import type { CalendarSymbols } from "../../types/calendar-symbols.types";
import type {
  CalendarViewName,
  TimelineScale,
} from "../../types/calendar-views.types";
import type { EventFilterQuery } from "../../types/event-filters.types";
import type {
  EventGrouping,
  EventGroupLevel,
} from "../../types/event-groups.types";

// 🏷️ Types

/**
 * The ways the page writes a change to the link.
 */
export interface UseCalendarSearchResult {
  /**
   * Answers how to list a month more of the agenda, which is written to the
   * link in place, or nothing once it lists a year.
   */
  getShowLater: (agendaDays: number) => (() => void) | undefined;
  handleClustersChange: (enabled: boolean) => void;
  handleColorByChange: (level: EventGroupLevel | undefined) => void;
  handleColorsChange: (enabled: boolean) => void;
  handleDateChange: (date: Date) => void;
  handleFilterChange: (filter: EventFilterQuery) => void;
  handleGroupingChange: (grouping: EventGrouping) => void;
  handleScaleChange: (scale: TimelineScale) => void;
  handleSymbolsChange: (symbols: CalendarSymbols) => void;
  handleViewChange: (view: CalendarViewName) => void;
  /**
   * Writes a change over the search the link already holds, pushing a new
   * entry unless `replace` is set.
   */
  updateSearch: (change: Partial<CalendarSearch>, replace?: boolean) => void;
}
