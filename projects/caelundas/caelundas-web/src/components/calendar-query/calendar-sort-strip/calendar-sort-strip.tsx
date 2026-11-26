import { ArrowUpDown } from "lucide-react";
import { useMemo } from "react";

import {
  Button,
  ButtonGroup,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import { useMetricCatalog } from "../../../hooks/use-metric-layout/hooks/use-metric-catalog/use-metric-catalog";
import { useStripLines } from "../../../hooks/use-strip-lines/use-strip-lines";
import { BUTTON_STRIP_CLASS_NAME } from "../../../hooks/use-strip-lines/use-strip-lines.constants";
import { isMetricView } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.utilities";
import { createEventGroupFields } from "../calendar-group-strip/components/event-group-model/event-group-fields.utilities";
import { StripFoldSection } from "../calendar-group-strip/components/strip-fold-button/strip-fold-section";
import { QueryCascader } from "../query-cascader/query-cascader";
import { keepHiddenValues } from "../query-cascader/query-cascader.utilities";

import {
  DEFAULT_SORT_LABEL,
  DEFAULT_SORTS,
  TAG_SORT_PARENT,
  TITLE,
} from "./calendar-sort-strip.constants";
import {
  createSortChipActions,
  createViewSortItems,
  getSortChipIcon,
  isSortChoice,
  labelSortChip,
  listSortNames,
  pathSort,
  toSorts,
  toSortValue,
} from "./calendar-sort-strip.utilities";
import { SortChip } from "./components/sort-chip/sort-chip";

import type { EventFacet } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { GroupSort } from "../calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { StripFold } from "../calendar-group-strip/components/strip-fold-button/strip-fold-button.types";
import type { ReactNode } from "react";

// 🔖 Type

/** Facets, shown sorts, view, and the change handler. */
export interface CalendarSortStripProperties {
  className?: string;
  /**
   * The columns the table shows; in the table, only they can be newly sorted by.
   */
  columns?: readonly string[] | undefined;
  facets?: readonly EventFacet[] | undefined;
  /** How the strip folds; it does not when absent. */
  fold?: StripFold | undefined;
  /**
   * The metrics the metric layouts measure; they can be sorted by any of these.
   */
  metrics?: readonly string[] | undefined;
  onSortChange: (sort: GroupSort[] | undefined) => void;
  sort: readonly GroupSort[] | undefined;
  view: CalendarViewName;
}

// 🧩 Component

/** Renders the Sort button, opening a searchable list to order groups by, with one chip per sort. */
export function CalendarSortStrip(
  properties: Readonly<CalendarSortStripProperties>,
): ReactNode {
  const {
    className,
    columns,
    facets = [],
    fold,
    metrics,
    onSortChange,
    sort,
    view,
  } = properties;

  // 🪝 Hooks
  const isShown = view === "timeline" || view === "table" || isMetricView(view);
  const { catalog } = useMetricCatalog();
  const { reference } = useStripLines(isShown);
  const fields = useMemo(() => createEventGroupFields(facets), [facets]);
  const items = useMemo(
    () => createViewSortItems(view, { columns, fields, metrics }, catalog),
    [catalog, columns, fields, metrics, view],
  );

  // 🏗 Setup
  const sorts = sort === undefined || sort.length === 0 ? DEFAULT_SORTS : sort;
  const isDefault = sort === undefined || sort.length === 0;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (!isShown) {
    return null;
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-sort-strip"
    >
      <ButtonGroup
        ref={reference}
        aria-label={TITLE}
        className={BUTTON_STRIP_CLASS_NAME}
        data-strip-buttons=""
      >
        <Popover>
          <PopoverTrigger
            render={
              <Button
                size="sm"
                variant="outline"
              >
                <ArrowUpDown aria-hidden="true" />
                {TITLE}
              </Button>
            }
          />
          <PopoverContent
            align="start"
            aria-label="Sort by"
            className="w-80 max-w-[90vw] p-0"
          >
            <QueryCascader
              cascade={false}
              defaultExpanded={["order", TAG_SORT_PARENT]}
              items={items}
              mode="tree"
              onValueChange={(next) => {
                onSortChange(
                  toSorts(
                    keepHiddenValues(next, toSortValue(sorts), items),
                    sorts,
                  ),
                );
              }}
              placeholder="Sort by"
              selectable={isSortChoice}
              value={toSortValue(sorts)}
              multiple
            />
          </PopoverContent>
        </Popover>
        <StripFoldSection
          fold={fold}
          names={listSortNames(sorts, isDefault, {
            bySlug: catalog.bySlug,
            fields,
          })}
          title={TITLE}
        >
          {sorts.map((current, index) => (
            <SortChip
              key={`${current.key}|${current.tag ?? ""}`}
              direction={current.direction}
              icon={getSortChipIcon(current, fields, catalog.bySlug)}
              label={
                isDefault
                  ? DEFAULT_SORT_LABEL
                  : labelSortChip(current, fields, catalog.bySlug)
              }
              {...createSortChipActions(sorts, index, {
                isDefault,
                onSortChange,
              })}
              title={pathSort(current, fields)}
            />
          ))}
        </StripFoldSection>
      </ButtonGroup>
    </div>
  );
}
