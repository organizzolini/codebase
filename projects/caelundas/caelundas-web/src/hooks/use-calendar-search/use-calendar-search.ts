import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";

import { toWindowSearch } from "../../components/calendar-controls/calendar-date-picker/calendar-date-picker.utilities";
import { formatCalendarDate } from "../../components/calendar-display/events-calendar/components/calendar-window/calendar-window.utilities";
import { createEventGroupFields } from "../../components/calendar-query/calendar-group-strip/components/event-group-model/event-group-fields.utilities";
import {
  dropHiddenSorts,
  getSelectedColumnIds,
} from "../../components/calendar-query/calendar-select-strip/calendar-select-strip-scope.utilities";

import type { EventFacet } from "../../components/calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { CalendarSearch } from "./calendar-search.types";
import type { UseCalendarSearchResult } from "./use-calendar-search.types";

// 🧩 Hook

/**
 * Writes every link change in one place; the filter replaces the history entry, so edits do not fill it.
 */
export function useCalendarSearch(
  timeZone: string,
  facets: readonly EventFacet[] = [],
  unoffered?: Partial<CalendarSearch>,
): UseCalendarSearchResult {
  // 🪝 Hooks
  const navigate = useNavigate({ from: "/" });
  const fields = useMemo(() => createEventGroupFields(facets), [facets]);

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
  // A link naming a tag a menu leaves out is rewritten without it, in place.
  useEffect(() => {
    if (unoffered !== undefined) {
      void navigate({
        replace: true,
        search: (previous) => ({ ...previous, ...unoffered }),
      });
    }
  }, [navigate, unoffered]);

  // 🎁 Result
  return {
    handleColorsChange: (enabled) => {
      updateSearch({ colors: enabled ? undefined : false }, true);
    },
    handleColumnsChange: (columns) => {
      // A column no longer shown keeps no sort, in the same history entry.
      void navigate({
        replace: false,
        search: (previous) => ({
          ...previous,
          columns,
          sort: dropHiddenSorts(
            previous.sort,
            getSelectedColumnIds(columns),
            fields,
          ),
        }),
      });
    },
    handleCompareChange: (enabled) => {
      updateSearch({ compare: enabled ? true : undefined }, true);
    },
    handleDateChange: (date) => {
      updateSearch({ date: formatCalendarDate(date, timeZone) });
    },
    handleFilterChange: (filter) => {
      updateSearch({ filter }, true);
    },
    handleFoldChange: (fold) => {
      updateSearch({ fold }, true);
    },
    handleGroupingChange: (group) => {
      // An empty grouping is the default, so the link drops it.
      updateSearch({ group: group.length === 0 ? undefined : group });
    },
    handleHideEmptyChange: (enabled) => {
      updateSearch({ hideEmpty: enabled ? true : undefined }, true);
    },
    handleMetricsChange: (metrics) => {
      // No metrics are the layout's defaults, so the link drops an empty list.
      updateSearch({ metrics: metrics?.length === 0 ? undefined : metrics });
    },
    handleRangeChange: (view, range) => {
      // The table's days and the timeline's scale are the view's own; the other
      // views open on the range's first day, and keep what they are.
      updateSearch(toWindowSearch(view, range));
    },
    handleScaleChange: (scale) => {
      updateSearch({ scale });
    },
    handleSortChange: (sort) => {
      // No sort is the default, so the link drops an empty list.
      updateSearch({ sort: sort?.length === 0 ? undefined : sort });
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
    handleViewPresetChange: ({ filter, group, sort }) => {
      // A view sets the filter, group and sort alone: the days, layout and display stay.
      updateSearch({ filter, group, sort });
    },
    updateSearch,
  };
}
