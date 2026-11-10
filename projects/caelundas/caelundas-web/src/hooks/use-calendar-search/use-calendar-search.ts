import { useNavigate } from "@tanstack/react-router";

import {
  AGENDA_DAY_COUNT,
  MAXIMUM_AGENDA_DAYS,
} from "../../components/events-calendar/calendar-views.constants";
import { formatCalendarDate } from "../../components/events-calendar/calendar-window.utilities";

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
    getShowLater: (agendaDays) =>
      agendaDays < MAXIMUM_AGENDA_DAYS
        ? (): void => {
            updateSearch(
              {
                days: Math.min(
                  MAXIMUM_AGENDA_DAYS,
                  agendaDays + AGENDA_DAY_COUNT,
                ),
              },
              true,
            );
          }
        : undefined,
    handleClustersChange: (enabled) => {
      updateSearch({ clusters: enabled ? undefined : false }, true);
    },
    handleColorByChange: (color) => {
      updateSearch({ color }, true);
    },
    handleColorsChange: (enabled) => {
      updateSearch({ colors: enabled ? undefined : false }, true);
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
    handleSymbolsChange: (symbols) => {
      updateSearch(
        { symbols: symbols === "emojis" ? "emojis" : undefined },
        true,
      );
    },
    handleViewChange: (view) => {
      // The agenda's extra days stay behind with a view change.
      updateSearch({ days: undefined, view });
    },
    updateSearch,
  };
}
