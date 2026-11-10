import {
  Button,
  ButtonGroup,
  Filters,
  useMediaQuery,
} from "@codebase/presentation";

import { useFilterQuery } from "../../hooks/use-filter-query/use-filter-query";
import { PresetPicker } from "../preset-picker/preset-picker";

import { EDITORS, TABLET_QUERY } from "./calendar-filters.constants";
import { renderFiltersButton } from "./calendar-filters.utilities";
import { EMPTY_EVENT_FILTER } from "./event-filter-tree.constants";
import { countActiveEventFilterRules } from "./event-filter-tree.utilities";
import { FilterChipRow } from "./filter-chip-row";
import { FilterSurface } from "./filter-surface";

import type {
  EventFilterField,
  EventFilterQuery,
  EventFilterValue,
} from "./event-filters.types";
import type { ResolvedPreset } from "./presets.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The fields the builder offers, the filter tree the link holds, and where
 * to send an edited one.
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
  const { handlePresetSelect, handleQueryChange, query } = useFilterQuery(
    filter,
    presets,
    onFilterChange,
  );
  const activeCount = countActiveEventFilterRules(query);

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-filters"
    >
      <ButtonGroup aria-label="Filter">
        <FilterSurface
          isTablet={isTablet}
          trigger={renderFiltersButton(activeCount)}
        >
          <div className="flex flex-col gap-3">
            <PresetPicker
              onSelect={handlePresetSelect}
              presets={presets}
              query={query}
            />
            <Filters<EventFilterValue>
              advancedMode="inline"
              editors={EDITORS}
              fields={[...fields]}
              onQueryChange={handleQueryChange}
              query={query}
              variant="advanced"
            />
          </div>
        </FilterSurface>
        <Button
          disabled={activeCount === 0}
          onClick={() => {
            handlePresetSelect(EMPTY_EVENT_FILTER);
          }}
          size="sm"
          variant="outline"
        >
          Clear
        </Button>
      </ButtonGroup>
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
  );
}
