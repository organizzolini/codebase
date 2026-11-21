import { useContext } from "react";

import {
  ButtonGroup,
  Filters,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useMediaQuery,
} from "@codebase/presentation";

import { useFilterQuery } from "../../../hooks/use-filter-query/use-filter-query";
import { CalendarNavigationSlot } from "../../calendar-controls/calendar-navigation-group/calendar-navigation-slot.constants";

import {
  EDITORS,
  STRIP_CLASS_NAME,
  TABLET_QUERY,
  TITLE,
} from "./calendar-filters.constants";
import { renderFiltersButton } from "./calendar-filters.utilities";
import { countActiveEventFilterRules } from "./components/event-filter-model/event-filter-tree.utilities";
import { FilterCascader } from "./components/filter-cascader/filter-cascader";
import { FilterChipRow } from "./components/filter-chip-row/filter-chip-row";

import type {
  EventFilterField,
  EventFilterQuery,
  EventFilterValue,
} from "./components/event-filter-model/event-filters.types";
import type { ResolvedPreset } from "./components/presets/presets.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The attributes to filter by, the link's filter tree, and the edit handler.
 */
export interface CalendarFiltersProperties {
  className?: string;
  fields: readonly EventFilterField[];
  filter: EventFilterQuery | undefined;
  /**
   * Called with every edit to write back to the link: the whole tree, empty
   * once nothing is left.
   */
  onFilterChange: (filter: EventFilterQuery) => void;
  /**
   * The named filters the menu applies in one step, which include the
   * default one the calendar opens on.
   */
  presets?: readonly ResolvedPreset[];
}

// 🧩 Component

/**
 * Renders the active filters as chips and the Filters button; edits show at once and only query-changing ones are written to the link.
 */
export function CalendarFilters(
  properties: Readonly<CalendarFiltersProperties>,
): ReactNode {
  const {
    className,
    fields,
    filter,
    onFilterChange,
    presets = [],
  } = properties;

  // 🪝 Hooks
  const isTablet = useMediaQuery(TABLET_QUERY);
  const navigation = useContext(CalendarNavigationSlot);
  const { handleQueryChange, query } = useFilterQuery(
    filter,
    presets,
    onFilterChange,
  );
  const activeCount = countActiveEventFilterRules(query);

  // 🏗 Setup
  const isAttached = navigation !== null || (isTablet && activeCount > 0);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-filters"
    >
      <div
        className={STRIP_CLASS_NAME}
        data-attached={isAttached ? "" : undefined}
        data-joined={isTablet && activeCount > 0 ? "" : undefined}
      >
        <ButtonGroup aria-label="Filter">
          <Popover>
            <PopoverTrigger
              render={renderFiltersButton(activeCount, isAttached)}
            />
            <PopoverContent
              align="start"
              aria-label={TITLE}
              className="w-auto max-w-[95vw] overflow-x-auto p-0"
              sideOffset={8}
            >
              <FilterCascader
                fields={fields}
                onQueryChange={handleQueryChange}
                query={query}
              />
            </PopoverContent>
          </Popover>
        </ButtonGroup>
        {navigation}
        {isTablet ? (
          <Filters<EventFilterValue>
            editors={EDITORS}
            fields={[...fields]}
            onQueryChange={handleQueryChange}
            query={query}
            size="sm"
          >
            <FilterChipRow />
          </Filters>
        ) : null}
      </div>
    </div>
  );
}
