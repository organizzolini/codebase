import { useMemo } from "react";

import { getDefaultFilter } from "../../../hooks/use-filter-query/use-filter-query.utilities";
import { CalendarFilters } from "../calendar-filters/calendar-filters";
import { createEventFilterFields } from "../calendar-filters/components/event-filter-model/event-filter-fields.utilities";
import { toLinkedEventFilter } from "../calendar-filters/components/event-filter-model/event-filter-tree.utilities";
import { CalendarGroupStrip } from "../calendar-group-strip/calendar-group-strip";
import { CalendarSortStrip } from "../calendar-sort-strip/calendar-sort-strip";
import { CalendarViewStrip } from "../calendar-view-strip/calendar-view-strip";

import type { EventFacet } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { EventFilterQuery } from "../calendar-filters/components/event-filter-model/event-filters.types";
import type { ResolvedPreset } from "../calendar-filters/components/presets/presets.types";
import type { EventGroupLevel } from "../calendar-group-by/components/event-group-model/event-groups.types";
import type { GroupSort } from "../calendar-group-by/components/event-group-tree/event-group-tree.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The data's facets, the view, the grouping and filter shown, their change handlers, and the presets.
 */
export interface CalendarQueryControlsProperties {
  className?: string;
  /**
   * Drawn after View, before Group: the Display menu.
   */
  display?: ReactNode;
  facets: readonly EventFacet[];
  filter: EventFilterQuery | undefined;
  grouping: readonly EventGroupLevel[];
  onFilterChange: (filter: EventFilterQuery) => void;
  onGroupingChange: (grouping: EventGroupLevel[]) => void;
  onSortChange: (sort: GroupSort | undefined) => void;
  presets: readonly ResolvedPreset[];
  sort: GroupSort | undefined;
  view: CalendarViewName;
}

// 🧩 Component

/**
 * Renders what asks the calendar a question, in a row: which view, how the calendar looks, how to group, how to sort, then what to filter by.
 */
export function CalendarQueryControls(
  properties: Readonly<CalendarQueryControlsProperties>,
): ReactNode {
  const {
    className,
    display,
    facets,
    filter,
    grouping,
    onFilterChange,
    onGroupingChange,
    onSortChange,
    presets,
    sort,
    view,
  } = properties;

  // 🪝 Hooks
  const fields = useMemo(() => createEventFilterFields(facets), [facets]);

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-query-controls"
    >
      <CalendarViewStrip
        className="contents"
        onSelect={(next) => {
          onFilterChange(toLinkedEventFilter(next));
        }}
        presets={presets}
        query={filter ?? getDefaultFilter(presets)}
      />
      {display}
      <CalendarGroupStrip
        className="contents"
        facets={facets}
        grouping={grouping}
        onGroupingChange={onGroupingChange}
        view={view}
      />
      <CalendarSortStrip
        className="contents"
        onSortChange={onSortChange}
        sort={sort}
        view={view}
      />
      <CalendarFilters
        className="contents"
        fields={fields}
        filter={filter}
        onFilterChange={onFilterChange}
        presets={presets}
      />
    </div>
  );
}
