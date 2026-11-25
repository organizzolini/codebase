import {
  findMetricValue,
  formatMetricChange,
  isAdditiveMetric,
} from "../calendar-metrics/calendar-metrics.utilities";
import {
  deriveChildColor,
  readOklch,
} from "../events-calendar/components/calendar-color-schemes/calendar-color-derive.utilities";

import {
  DEFAULT_FILL,
  LABEL_LENGTH,
  MONOCHROME_FILL,
  MONOCHROME_STROKE,
  PERCENT_SCALE,
  PREVIOUS_SERIES,
  TOOLTIP_ROWS,
} from "./calendar-charts.constants";

import type { EventMetric } from "../../../graphql/generated/operations";
import type { UseMetricLayoutResult } from "../../../hooks/use-metric-layout/use-metric-layout.types";
import type { GroupSort } from "../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type {
  MetricGroup,
  MetricNode,
} from "../calendar-metrics/calendar-metrics.types";
import type {
  ChartBar,
  ChartBarOptions,
  ChartPaint,
  ChartSegment,
  ChartsNoticeKind,
  PendingGroup,
} from "./calendar-charts.types";

// 🔏 Private Functions

/**
 * The bars of one metric's chart, a bar for each group shown, stacked by subgroups where the metric adds up.
 */
export function buildChartBars(
  rows: readonly MetricNode[],
  metric: EventMetric,
  options: Readonly<ChartBarOptions>,
): ChartBar[] {
  const whole = findWhole(rows, metric);

  const bars: ChartBar[] = [];

  for (const node of rows) {
    const { value, ...found } = readGroupValue(node.group, metric);
    const previous = options.compare ? found.previous : null;
    const text = options.format(metric, value);

    bars.push({
      ariaLabel: `${node.group.label}: ${text}`,
      change:
        previous === null
          ? undefined
          : formatMetricChange(metric, value, previous),
      color: options.colors?.get(node.group.id),
      id: node.group.id,
      isExpandable: node.isExpandable,
      label: node.group.label,
      previous,
      previousText: previous === null ? "" : options.format(metric, previous),
      segments: toSegments(node, metric, { options, whole }),
      target: node.isExpandable ? node.group.id : node.ancestors.at(-1)?.id,
      text,
    });
  }

  return bars;
}

/**
 * Colors every group by its id: a tag's own color by its key, else a shade near its parent's; none when colors are off.
 */
export function colorMetricGroups(
  groups: readonly MetricGroup[],
  tagColors: ReadonlyMap<string, string> | undefined,
): ReadonlyMap<string, string> | undefined {
  if (tagColors === undefined) {
    return undefined;
  }

  const colors = new Map<string, string>();
  const pending: PendingGroup[] = groups
    .map((group, index) => ({
      count: groups.length,
      depth: 1,
      group,
      index,
      parent: undefined,
    }))
    .toReversed();

  for (let item = pending.pop(); item !== undefined; item = pending.pop()) {
    const { count, depth, group, index, parent } = item;
    const own = group.key === null ? undefined : tagColors.get(group.key);
    const color =
      own ??
      (parent === undefined
        ? undefined
        : deriveChildColor(readOklch(parent), {
            depth,
            index,
            siblingCount: count,
          }));
    const children = group.children ?? [];

    if (color !== undefined) {
      colors.set(group.id, color);
    }

    pending.push(
      ...children
        .map((child, childIndex) => ({
          count: children.length,
          depth: depth + 1,
          group: child,
          index: childIndex,
          parent: color,
        }))
        .toReversed(),
    );
  }

  return colors;
}

/**
 * The sorts after a click on a metric's sort button: appended ascending, then descending, then removed.
 */
export function cycleMetricSort(
  sorts: readonly GroupSort[] | undefined,
  metric: EventMetric,
): GroupSort[] | undefined {
  const current = sorts ?? [];
  const direction = findMetricSortDirection(sorts, metric);

  if (direction === undefined) {
    return [...current, { direction: "asc", key: "metric", metric }];
  }

  const next =
    direction === "asc"
      ? current.map((sort) =>
          isMetricSort(sort, metric)
            ? { ...sort, direction: "desc" as const }
            : sort,
        )
      : current.filter((sort) => !isMetricSort(sort, metric));

  return next.length === 0 ? undefined : next;
}

/**
 * The piece at a position of a bar; none where the bar has fewer.
 */
export function findChartSegment(
  bar: ChartBar,
  position?: number,
): ChartSegment | undefined {
  return position === undefined ? undefined : bar.segments[position];
}

/**
 * Why there is no chart to draw: a failed read, metrics not read yet, or no group; nothing when there is one.
 */
export function findChartsNotice(
  layout: Pick<UseMetricLayoutResult, "data" | "rows" | "status">,
): ChartsNoticeKind | undefined {
  if (layout.status === "error") {
    return "error";
  }

  if (layout.data === undefined) {
    return "loading";
  }

  return layout.rows.length === 0 ? "empty" : undefined;
}

/**
 * The way a metric's sort orders the groups; none when no sort is by it.
 */
export function findMetricSortDirection(
  sorts: readonly GroupSort[] | undefined,
  metric: EventMetric,
): GroupSort["direction"] | undefined {
  return sorts?.find((sort) => isMetricSort(sort, metric))?.direction;
}

/**
 * How the previous period's bar is painted: muted, or black with a white border when colors are off.
 */
export function findPreviousPaint(plain: boolean): ChartPaint {
  return plain
    ? { fill: MONOCHROME_FILL, fillOpacity: 0.4, stroke: MONOCHROME_STROKE }
    : {
        fill: "var(--muted-foreground)",
        fillOpacity: 0.25,
        stroke: "var(--muted-foreground)",
      };
}

/**
 * How a piece of a bar is painted: its color, else the default; black with a white border when colors are off.
 */
export function findSeriesPaint(
  color: string | undefined,
  plain: boolean,
): ChartPaint {
  return plain
    ? { fill: MONOCHROME_FILL, stroke: MONOCHROME_STROKE }
    : { fill: color ?? DEFAULT_FILL };
}

/**
 * Whether no bar nor piece has a color, as when colors are off, so they are drawn black with white borders.
 */
export function isMonochrome(bars: readonly ChartBar[]): boolean {
  return bars.every(
    (bar) =>
      bar.color === undefined &&
      bar.segments.every((segment) => segment.color === undefined),
  );
}

/**
 * The first rows of a tooltip's list, the previous period's among them, and how many were left out.
 */
export function limitTooltipRows<Row extends { name?: unknown }>(
  rows: readonly Row[] | undefined,
): { hidden: number; shown: Row[] } {
  const all = rows ?? [];
  const shown = all.filter(
    (row, index) => row.name === PREVIOUS_SERIES || index < TOOLTIP_ROWS,
  );

  return { hidden: all.length - shown.length, shown };
}

/**
 * A chart's stacked series, one per stack position, so they stay few however many groups show.
 */
export function listChartSeries(bars: readonly ChartBar[]): number[] {
  let count = 0;

  for (const bar of bars) {
    count = Math.max(count, bar.segments.length);
  }

  return Array.from({ length: count }, (_value, position) => position);
}

/**
 * A group's label cut to fit under its column, with an ellipsis when it was cut.
 */
export function truncateChartLabel(label = ""): string {
  return label.length > LABEL_LENGTH
    ? `${label.slice(0, LABEL_LENGTH - 1)}…`
    : label;
}

/**
 * The whole the shares are taken of: the sum of the groups' values where the metric adds up, else none.
 */
function findWhole(rows: readonly MetricNode[], metric: EventMetric): number {
  let sum = 0;

  for (const { group } of rows) {
    sum += readGroupValue(group, metric).value ?? 0;
  }

  return isAdditiveMetric(metric) ? sum : 0;
}

// 🌎 Public Functions

/**
 * A ratio as a whole percent, such as `40%`.
 */
function formatShare(ratio: number): string {
  return `${String(Math.round(ratio * PERCENT_SCALE))}%`;
}

/**
 * Whether a sort orders the groups by a metric.
 */
function isMetricSort(sort: GroupSort, metric: EventMetric): boolean {
  return sort.key === "metric" && sort.metric === metric;
}

/**
 * What a group's bar is drawn from: its subgroups for a metric that adds up, else the group whole.
 */
function listParts(
  node: MetricNode,
  metric: EventMetric,
): readonly MetricGroup[] {
  const children = node.group.children ?? [];

  return children.length > 0 && isAdditiveMetric(metric)
    ? children
    : [node.group];
}

/**
 * A group's number for a metric, and the previous period's.
 */
function readGroupValue(
  group: MetricGroup,
  metric: EventMetric,
): { previous: null | number; value: null | number } {
  const found = findMetricValue(group.values, metric);

  return { previous: found?.previous ?? null, value: found?.value ?? null };
}

/**
 * The pieces a group's bar is drawn from, each in its color with its share of every bar shown.
 */
function toSegments(
  node: MetricNode,
  metric: EventMetric,
  context: Readonly<{ options: ChartBarOptions; whole: number }>,
): ChartSegment[] {
  const { options, whole } = context;
  const segments: ChartSegment[] = [];

  // A loop rather than a map, and no helper, keeps the call stack shallow.
  for (const part of listParts(node, metric)) {
    const value = findMetricValue(part.values, metric)?.value ?? null;
    const amount = value ?? 0;

    segments.push({
      color: options.colors?.get(part.id),
      id: part.id,
      isExpandable: part.children !== undefined && part.children.length > 0,
      label: part.label,
      share: whole === 0 ? "" : formatShare(amount / whole),
      text: options.format(metric, value),
      value: amount,
    });
  }

  return segments;
}
