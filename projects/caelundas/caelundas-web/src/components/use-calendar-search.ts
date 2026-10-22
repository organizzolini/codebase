import { useNavigate } from "@tanstack/react-router";

import { formatCalendarDate } from "../lib/calendar/calendar-window";

import type { CalendarSearch } from "../lib/calendar/calendar-search";
import type { EventFilterQuery } from "../lib/event-filters/event-filters.types";

/**
 * The ways the page writes a change to the link.
 */
export interface CalendarSearchUpdates {
  handleDateChange: (date: Date) => void;
  handleFilterChange: (filter: EventFilterQuery) => void;
  /**
   * Writes a change over the search the link already holds, pushing a new
   * entry unless `replace` is set.
   */
  updateSearch: (change: Partial<CalendarSearch>, replace?: boolean) => void;
}

/**
 * Writes changes to the link, one place for all of them: a new day, the
 * filter, or any other setting. The filter replaces the entry, so an edit to
 * it does not fill the history.
 */
export function useCalendarSearch(timeZone: string): CalendarSearchUpdates {
  const navigate = useNavigate({ from: "/" });
  const updateSearch = (
    change: Partial<CalendarSearch>,
    replace = false,
  ): void => {
    void navigate({
      replace,
      search: (previous) => ({ ...previous, ...change }),
    });
  };

  return {
    handleDateChange: (date) => {
      updateSearch({ date: formatCalendarDate(date, timeZone) });
    },
    handleFilterChange: (filter) => {
      updateSearch({ filter }, true);
    },
    updateSearch,
  };
}
