import { useMemo } from "react";

import { getDefaultFilter } from "../../../hooks/use-filter-query/use-filter-query.utilities";
import { CalendarFilters } from "../calendar-filters/calendar-filters";
import { createEventFilterFields } from "../calendar-filters/components/event-filter-model/event-filter-fields.utilities";
import { toLinkedEventFilter } from "../calendar-filters/components/event-filter-model/event-filter-tree.utilities";
import { CalendarGroupStrip } from "../calendar-group-strip/calendar-group-strip";
import { CalendarPageStrip } from "../calendar-page-strip/calendar-page-strip";
import { CalendarSelectStrip } from "../calendar-select-strip/calendar-select-strip";
import {
  getSelectedColumnIds,
  restrictFilterFields,
} from "../calendar-select-strip/calendar-select-strip-scope.utilities";
import { CalendarSortStrip } from "../calendar-sort-strip/calendar-sort-strip";
import { CalendarViewStrip } from "../calendar-view-strip/calendar-view-strip";

import type { EventFacet } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { EventFilterQuery } from "../calendar-filters/components/event-filter-model/event-filters.types";
import type { ResolvedPreset } from "../calendar-filters/components/presets/presets.types";
import type { EventGroupLevel } from "../calendar-group-strip/components/event-group-model/event-groups.types";
import type { GroupSort } from "../calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { ReactNode } from "react";

// 🔖 Type

/** Facets, view, grouping, filter, their change handlers, and presets. */
export interface CalendarQueryControlsProperties {
  className?: string;
  /**
   * Drawn after View, before Select: the Display menu.
   */
  columns?: readonly string[] | undefined;
  display?: ReactNode;
  facets: readonly EventFacet[];
  filter: EventFilterQuery | undefined;
  grouping: readonly EventGroupLevel[];
  /** Whether the link names no grouping. */
  isDefaultGrouping?: boolean | undefined;
  onColumnsChange: (columns: readonly string[] | undefined) => void;
  onFilterChange: (filter: EventFilterQuery) => void;
  onGroupingChange: (grouping: EventGroupLevel[]) => void;
  onSortChange: (sort: readonly GroupSort[] | undefined) => void;
  presets: readonly ResolvedPreset[];
  sort: readonly GroupSort[] | undefined;
  view: CalendarViewName;
}

// 🧩 Component

/** Renders what asks the calendar a question, in a row: view, look, grouping, sorting, then filter. */
export function CalendarQueryControls(
  properties: Readonly<CalendarQueryControlsProperties>,
): ReactNode {
  const {
    className,
    columns,
    display,
    facets,
    filter,
    grouping,
    isDefaultGrouping,
    onColumnsChange,
    onFilterChange,
    onGroupingChange,
    onSortChange,
    presets,
    sort,
    view,
  } = properties;

  // 🪝 Hooks
  const { fields, offered } = useMemo(() => {
    const all = createEventFilterFields(facets);

    return {
      fields: all,
      offered:
        view === "table"
          ? restrictFilterFields(all, getSelectedColumnIds(columns))
          : all,
    };
  }, [columns, facets, view]);

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
      <CalendarSelectStrip
        className="contents"
        columns={columns}
        facets={facets}
        onColumnsChange={onColumnsChange}
        view={view}
      />
      <CalendarPageStrip
        className="contents"
        view={view}
      />
      <CalendarGroupStrip
        className="contents"
        facets={facets}
        grouping={grouping}
        isDefaultGrouping={isDefaultGrouping}
        onGroupingChange={onGroupingChange}
        view={view}
      />
      <CalendarSortStrip
        className="contents"
        columns={columns}
        facets={facets}
        onSortChange={onSortChange}
        sort={sort}
        view={view}
      />
      <CalendarFilters
        className="contents"
        fields={fields}
        filter={filter}
        offeredFields={offered}
        onFilterChange={onFilterChange}
        presets={presets}
      />
    </div>
  );
}
