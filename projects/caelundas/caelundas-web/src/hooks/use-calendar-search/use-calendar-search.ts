import { useNavigate } from "@tanstack/react-router";

import {
  AGENDA_DAY_COUNT,
  MAXIMUM_AGENDA_DAYS,
} from "../../constants/calendar-views.constants";
import { formatCalendarDate } from "../../utilities/calendar-window.utilities";

import type { CalendarSearch } from "../../types/calendar-search.types";
import type { UseCalendarSearchResult } from "./use-calendar-search.types";

// 🧩 Hook

/**
 * Writes changes to the link, one place for all of them: a new day, the
 * filter, or any other setting. The filter replaces the entry, so an edit to
 * it does not fill the history.
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
