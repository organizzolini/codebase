import { ListFilter } from "lucide-react";

import {
  Badge,
  Button,
  ButtonGroup,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  FilterChip,
  Filters,
  flattenFilterRules,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  useFilterState,
  useMediaQuery,
} from "@codebase/presentation";

import {
  countActiveEventFilterRules,
  EMPTY_EVENT_FILTER,
} from "../lib/event-filters/event-filter-tree";
import {
  DATE_RANGE_EDITOR,
  TAG_OPTIONS_EDITOR,
} from "../lib/event-filters/event-filters.constants";

import { CalendarCollectionPicker } from "./calendar-collection-picker";
import { CalendarColorOptions } from "./calendar-color-options";
import { CalendarViewMenu } from "./calendar-view-menu";
import { FilterDateRangeEditor } from "./filter-date-range-editor";
import { FilterTagEditor } from "./filter-tag-editor";
import { useFilterQuery } from "./use-filter-query";

import type { CalendarSymbols } from "../lib/calendar/calendar-symbols";
import type {
  EventFilterField,
  EventFilterQuery,
  EventFilterValue,
} from "../lib/event-filters/event-filters.types";
import type { EventGroupLevel } from "../lib/event-groups/event-groups.types";
import type { EventFacet } from "../lib/events-database/events-database.types";
import type { FilterEditorRegistry } from "@codebase/presentation";
import type { ReactElement, ReactNode } from "react";

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

const TITLE = "Filter";
const EDITORS: FilterEditorRegistry = {
  [DATE_RANGE_EDITOR]: FilterDateRangeEditor,
  [TAG_OPTIONS_EDITOR]: FilterTagEditor,
};
const TABLET_QUERY = "(min-width: 768px)";

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

/**
 * Draws one chip per rule of the tree in the surrounding `Filters`, nested
 * ones included, in a row that wraps onto more rows. Unlike
 * the vendored chip row, it leaves out the Add filter button: rules are added
 * in the builder.
 */
function FilterChipRow(): ReactNode {
  const { query } = useFilterState<EventFilterValue>();
  const rules = flattenFilterRules(query);

  if (rules.length === 0) {
    return null;
  }

  return (
    <div
      aria-label={TITLE}
      className="contents"
      role="toolbar"
    >
      {rules.map((rule, index) => (
        <FilterChip
          key={rule.id}
          index={index}
          rule={rule}
        />
      ))}
    </div>
  );
}

/**
 * Opens the builder over the calendar from its trigger: a popover from 1024
 * pixels wide, a drawer from the side from 768, and a bottom sheet below
 * that, so it never keeps any of the calendar's space.
 */
function FilterSurface(
  properties: Readonly<{
    children: ReactNode;
    isTablet: boolean;
    trigger: ReactElement;
  }>,
): ReactNode {
  const { children, isTablet, trigger } = properties;
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  if (isDesktop) {
    return (
      <Popover>
        <PopoverTrigger render={trigger} />
        <PopoverContent
          align="start"
          aria-label={TITLE}
          className="max-h-[80dvh] w-[42rem] max-w-[95vw] gap-3 overflow-y-auto p-3"
          sideOffset={8}
        >
          {children}
        </PopoverContent>
      </Popover>
    );
  }

  if (isTablet) {
    return (
      <Drawer swipeDirection="right">
        <DrawerTrigger render={trigger} />
        <DrawerContent className="data-[swipe-axis=x]:sm:[--drawer-content-width:36rem]">
          <DrawerHeader>
            <DrawerTitle>{TITLE}</DrawerTitle>
          </DrawerHeader>
          <div className="min-h-0 overflow-y-auto px-3 pb-4">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet>
      <SheetTrigger render={trigger} />
      <SheetContent
        className="max-h-[85dvh]"
        side="bottom"
      >
        <SheetHeader>
          <SheetTitle>{TITLE}</SheetTitle>
        </SheetHeader>
        <div className="min-h-0 overflow-y-auto px-3 pb-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * The Filters button, badged with the number of finished rules, which its
 * accessible name also says.
 */
function renderFiltersButton(activeCount: number): ReactElement {
  return (
    <Button
      aria-label={
        activeCount === 0 ? TITLE : `${TITLE}, ${String(activeCount)} active`
      }
      size="sm"
      variant="outline"
    >
      <ListFilter aria-hidden="true" />
      {TITLE}
      {activeCount === 0 ? null : (
        <Badge
          aria-hidden="true"
          className="tabular-nums"
          variant="secondary"
        >
          {activeCount}
        </Badge>
      )}
    </Button>
  );
}
