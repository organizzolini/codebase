import { useNavigate } from "@tanstack/react-router";

import { formatCalendarDate } from "../../components/calendar-display/events-calendar/components/calendar-window/calendar-window.utilities";

import type { CalendarSearch } from "./calendar-search.types";
import type { UseCalendarSearchResult } from "./use-calendar-search.types";

// 🧩 Hook

/**
 * Writes every link change in one place; the filter replaces the history entry, so edits do not fill it.
 */
export function useCalendarSearch(timeZone: string): UseCalendarSearchResult {
  // 🪝 Hooks
  const navigate = useNavigate({ from: "/" });

  // 🏗 Setup

  // 💪 Handlers
  const updateSearch = (
    change: Partial<CalendarSearch>,
    replace = false,
  ): void => {
    void navigate({
      replace,
      search: (previous) => ({ ...previous, ...change }),
    });
  };

  // ♻️ Lifecycle

  // 🎁 Result
  return {
    handleClustersChange: (enabled) => {
      updateSearch({ clusters: enabled ? undefined : false }, true);
    },
    handleColorsChange: (enabled) => {
      updateSearch({ colors: enabled ? undefined : false }, true);
    },
    handleColumnsChange: (columns) => {
      updateSearch({ columns });
    },
    handleDateChange: (date) => {
      updateSearch({ date: formatCalendarDate(date, timeZone) });
    },
    handleFilterChange: (filter) => {
      updateSearch({ filter }, true);
    },
    handleGroupingChange: (group) => {
      updateSearch({ group });
    },
    handleScaleChange: (scale) => {
      updateSearch({ scale });
    },
    handleSortChange: (sort) => {
      updateSearch({ sort });
    },
    handleSymbolsChange: (symbols) => {
      updateSearch(
        { symbols: symbols === "emojis" ? "emojis" : undefined },
        true,
      );
    },
    handleViewChange: (view) => {
      // The table's extra days stay behind with a view change.
      updateSearch({ days: undefined, view });
    },
    updateSearch,
  };
}
