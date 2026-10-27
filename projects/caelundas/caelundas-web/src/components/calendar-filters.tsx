import {
  Button,
  ButtonGroup,
  Filters,
  useMediaQuery,
} from "@codebase/presentation";

import { EMPTY_EVENT_FILTER } from "../constants/event-filter-tree.constants";
import { useFilterQuery } from "../hooks/use-filter-query/use-filter-query";
import { countActiveEventFilterRules } from "../utilities/event-filter-tree.utilities";

import { CalendarCollectionPicker } from "./calendar-collection-picker";
import { CalendarColorOptions } from "./calendar-color-options";
import { EDITORS, TABLET_QUERY } from "./calendar-filters.constants";
import { renderFiltersButton } from "./calendar-filters.utilities";
import { CalendarViewMenu } from "./calendar-view-menu";
import { FilterChipRow } from "./filter-chip-row";
import { FilterSurface } from "./filter-surface";

import type { CalendarSymbols } from "../types/calendar-symbols.types";
import type {
  EventFilterField,
  EventFilterQuery,
  EventFilterValue,
} from "../types/event-filters.types";
import type { EventGroupLevel } from "../types/event-groups.types";
import type { EventFacet } from "../types/events-database.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The fields the builder offers, the filter tree the link holds, and where
 * to send an edited one.
 */
export interface CalendarFiltersProperties {
  className?: string;
  /**
   * Whether the views of hours merge events that run together, which the View
   * menu turns on or off; on when absent.
   */
  clusters?: boolean;
  /**
   * What the events are colored by, which the View menu's Color by submenu
   * changes; the type, kind by kind, when absent.
   */
  colorBy?: EventGroupLevel | undefined;
  /**
   * Whether events are colored by type, which the View menu turns on or off;
   * on when absent.
   */
  colors?: boolean;
  /**
   * The tags of the data, from which the collections the menu applies in one
   * step are resolved, and the default one the calendar opens on.
   */
  facets?: readonly EventFacet[];
  fields: readonly EventFilterField[];
  filter: EventFilterQuery | undefined;
  /**
   * Called with the merging setting picked in the View menu.
   */
  onClustersChange?: (enabled: boolean) => void;
  /**
   * Called with what the events are colored by as picked in the View menu, or
   * `undefined` for the default.
   */
  onColorByChange?: (level: EventGroupLevel | undefined) => void;
  /**
   * Called with the colors setting picked in the View menu; the menu offers
   * no choice without it.
   */
  onColorsChange?: (enabled: boolean) => void;
  /**
   * Called with every edit to write back to the link: the whole tree, empty
   * once nothing is left.
   */
  onFilterChange: (filter: EventFilterQuery) => void;
  /**
   * Called with the symbols setting picked in the View menu.
   */
  onSymbolsChange?: ((symbols: CalendarSymbols) => void) | undefined;
  /**
   * How symbols are drawn, which the View menu changes; icons when absent.
   */
  symbols?: CalendarSymbols | undefined;
  /**
   * What the view shown can be arranged by, which the View menu draws ahead of
   * its own sections.
   */
  viewOptions?: ReactNode;
}

// 🧩 Component

/**
 * Renders the active filters as chips, then the Filters button with a count
 * of the finished rules, which opens the nested AND/OR filter builder. The
 * chips scroll sideways rather than wrap the toolbar row, and are left out on
 * a phone, where the count stands for them. The tree being edited is held
 * here, so each edit shows at once and only one that changes the query is
 * written to the link; a link that changes to something else, such as one
 * reached with Back, replaces it.
 */
export function CalendarFilters(
  properties: Readonly<CalendarFiltersProperties>,
): ReactNode {
  const {
    className,
    clusters = true,
    colorBy,
    colors = true,
    facets = [],
    fields,
    filter,
    onClustersChange = () => {},
    onColorByChange = () => {},
    onColorsChange = () => {},
    onFilterChange,
    onSymbolsChange,
    symbols,
    viewOptions,
  } = properties;

  // 🪝 Hooks
  const isTablet = useMediaQuery(TABLET_QUERY);
  const { collections, handleCollectionSelect, handleQueryChange, query } =
    useFilterQuery(filter, facets, onFilterChange);
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
      <CalendarViewMenu
        clusters={clusters}
        colorOptions={
          <CalendarColorOptions
            colorBy={colorBy}
            facets={facets}
            onColorByChange={onColorByChange}
          />
        }
        colors={colors}
        onClustersChange={onClustersChange}
        onColorsChange={onColorsChange}
        onSymbolsChange={onSymbolsChange}
        symbols={symbols}
      >
        {viewOptions}
      </CalendarViewMenu>
      <ButtonGroup aria-label="Filter">
        <FilterSurface
          isTablet={isTablet}
          trigger={renderFiltersButton(activeCount)}
        >
          <div className="flex flex-col gap-3">
            <CalendarCollectionPicker
              collections={collections}
              onSelect={handleCollectionSelect}
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
            handleCollectionSelect(EMPTY_EVENT_FILTER);
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
