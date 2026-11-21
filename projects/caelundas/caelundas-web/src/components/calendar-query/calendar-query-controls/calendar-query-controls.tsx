import { useMemo } from "react";

import { CalendarFilters } from "../calendar-filters/calendar-filters";
import { createEventFilterFields } from "../calendar-filters/components/event-filter-model/event-filter-fields.utilities";
import { CalendarGroupStrip } from "../calendar-group-strip/calendar-group-strip";

import type { EventFacet } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { EventFilterQuery } from "../calendar-filters/components/event-filter-model/event-filters.types";
import type { ResolvedPreset } from "../calendar-filters/components/presets/presets.types";
import type { EventGroupLevel } from "../calendar-group-by/components/event-group-model/event-groups.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The data's facets, the view, the grouping and filter shown, their change handlers, and the presets.
 */
export interface CalendarQueryControlsProperties {
  className?: string;
  facets: readonly EventFacet[];
  filter: EventFilterQuery | undefined;
  grouping: readonly EventGroupLevel[];
  onFilterChange: (filter: EventFilterQuery) => void;
  onGroupingChange: (grouping: EventGroupLevel[]) => void;
  presets: readonly ResolvedPreset[];
  view: CalendarViewName;
}

// 🧩 Component

/**
 * Renders what asks the calendar a question, in a row: how to group, then what to filter by.
 */
export function CalendarQueryControls(
  properties: Readonly<CalendarQueryControlsProperties>,
): ReactNode {
  const {
    className,
    facets,
    filter,
    grouping,
    onFilterChange,
    onGroupingChange,
    presets,
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
      <CalendarGroupStrip
        className="contents"
        facets={facets}
        grouping={grouping}
        onGroupingChange={onGroupingChange}
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
