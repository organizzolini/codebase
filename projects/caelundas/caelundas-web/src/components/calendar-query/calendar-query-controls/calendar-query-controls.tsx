import { useMemo } from "react";

import { getDefaultFilter } from "../../../hooks/use-filter-query/use-filter-query.utilities";
import { useMetricCatalog } from "../../../hooks/use-metric-layout/hooks/use-metric-catalog/use-metric-catalog";
import { resolveMetrics } from "../../calendar-display/calendar-metrics/calendar-metrics.utilities";
import { isMetricView } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.utilities";
import { CalendarFilters } from "../calendar-filters/calendar-filters";
import { createEventFilterFields } from "../calendar-filters/components/event-filter-model/event-filter-fields.utilities";
import { toLinkedEventFilter } from "../calendar-filters/components/event-filter-model/event-filter-tree.utilities";
import { CalendarGroupStrip } from "../calendar-group-strip/calendar-group-strip";
import {
  createStripFolds,
  parseFoldedStrips,
} from "../calendar-group-strip/components/strip-fold-button/strip-fold-button.utilities";
import { CalendarPageStrip } from "../calendar-page-strip/calendar-page-strip";
import { CalendarSelectStrip } from "../calendar-select-strip/calendar-select-strip";
import {
  getSelectedColumnIds,
  restrictFilterFields,
} from "../calendar-select-strip/calendar-select-strip-scope.utilities";
import { MetricSelectStrip } from "../calendar-select-strip/components/metric-select-strip/metric-select-strip";
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
  columns?: readonly string[] | undefined;
  /**
   * Drawn after Layout, before View: the Display menu.
   */
  display?: ReactNode;
  facets: readonly EventFacet[];
  filter: EventFilterQuery | undefined;
  /** The strips the link folds, comma-separated; none when absent. */
  fold?: string | undefined;
  grouping: readonly EventGroupLevel[];
  /** Whether the link names no grouping. */
  isDefaultGrouping?: boolean | undefined;
  /**
   * Drawn first, before Display: the Layout menu.
   */
  layout?: ReactNode;
  /**
   * The metrics the Charts and Totals layouts measure; their defaults when absent.
   */
  metrics?: readonly string[] | undefined;
  onColumnsChange: (columns: readonly string[] | undefined) => void;
  onFilterChange: (filter: EventFilterQuery) => void;
  /** Writes the folded strips to the link; the strips do not fold when absent. */
  onFoldChange?: ((fold: string | undefined) => void) | undefined;
  onGroupingChange: (grouping: EventGroupLevel[]) => void;
  onMetricsChange?:
    | ((metrics: readonly string[] | undefined) => void)
    | undefined;
  onSortChange: (sort: readonly GroupSort[] | undefined) => void;
  presets: readonly ResolvedPreset[];
  sort: readonly GroupSort[] | undefined;
  view: CalendarViewName;
}

// 🧩 Component

/** Renders what asks the calendar a question, in a row: layout, look, view, paging, selecting, grouping, sorting, then filter. */
export function CalendarQueryControls(
  properties: Readonly<CalendarQueryControlsProperties>,
): ReactNode {
  const {
    className,
    columns,
    display,
    facets,
    filter,
    fold,
    grouping,
    isDefaultGrouping,
    layout,
    metrics,
    onColumnsChange,
    onFilterChange,
    onFoldChange,
    onGroupingChange,
    onMetricsChange,
    onSortChange,
    presets,
    sort,
    view,
  } = properties;

  // 🪝 Hooks
  const { catalog } = useMetricCatalog();
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

  const folds = useMemo(
    () => createStripFolds(parseFoldedStrips(fold), onFoldChange),
    [fold, onFoldChange],
  );

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
      {layout}
      {display}
      <CalendarViewStrip
        className="contents"
        onSelect={(next) => {
          onFilterChange(toLinkedEventFilter(next));
        }}
        presets={presets}
        query={filter ?? getDefaultFilter(presets)}
      />
      <CalendarPageStrip
        className="contents"
        view={view}
      />
      {isMetricView(view) ? (
        <MetricSelectStrip
          className="contents"
          fold={folds.select}
          metrics={resolveMetrics(catalog, view, metrics)}
          onMetricsChange={onMetricsChange}
          view={view}
        />
      ) : (
        <CalendarSelectStrip
          className="contents"
          columns={columns}
          facets={facets}
          fold={folds.select}
          onColumnsChange={onColumnsChange}
          view={view}
        />
      )}
      <CalendarGroupStrip
        className="contents"
        facets={facets}
        fold={folds.group}
        grouping={grouping}
        isDefaultGrouping={isDefaultGrouping}
        onGroupingChange={onGroupingChange}
        view={view}
      />
      <CalendarSortStrip
        className="contents"
        columns={columns}
        facets={facets}
        fold={folds.sort}
        metrics={metrics}
        onSortChange={onSortChange}
        sort={sort}
        view={view}
      />
      <CalendarFilters
        className="contents"
        fields={fields}
        filter={filter}
        fold={folds.filter}
        offeredFields={offered}
        onFilterChange={onFilterChange}
        presets={presets}
      />
    </div>
  );
}
