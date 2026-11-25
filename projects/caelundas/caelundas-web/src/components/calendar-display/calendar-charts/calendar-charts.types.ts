import type { EventMetric } from "../../../graphql/generated/operations";
import type {
  MetricChange,
  MetricGroup,
} from "../calendar-metrics/calendar-metrics.types";

// 🏷️ Types

/**
 * A value axis: its span, and a duration's ticks and unit.
 */
export interface ChartAxis {
  domain: [number, "auto" | number];
  ticks: number[] | undefined;
  unit: DurationUnit | undefined;
}

/**
 * A chart column: a group's value, drawn from segments, plus the previous's.
 */
export interface ChartBar {
  /**
   * What a screen reader hears: the group and its value.
   */
  ariaLabel: string;
  change: MetricChange | undefined;
  /**
   * The group's color, which its pieces shade; none when colors are off.
   */
  color: string | undefined;
  id: string;
  isExpandable: boolean;
  label: string;
  /**
   * The previous period's value; none when not compared.
   */
  previous: null | number;
  previousText: string;
  segments: readonly ChartSegment[];
  /**
   * The id of the group a click opens or closes; none when nothing can.
   */
  target: string | undefined;
  text: string;
}

/**
 * The inputs a chart's bars are drawn from.
 */
export interface ChartBarOptions {
  colors: ReadonlyMap<string, string> | undefined;
  compare: boolean;
  /**
   * Writes a metric's value as text, as the chart's bars and tooltip show it.
   */
  format: (metric: EventMetric, value: null | number) => string;
}

/**
 * How a bar is painted: fill, opacity and border.
 */
export interface ChartPaint {
  fill: string;
  fillOpacity?: number;
  stroke?: string;
}

/**
 * A piece of a bar: a subgroup's value, or a whole group's.
 */
export interface ChartSegment {
  color: string | undefined;
  id: string;
  /**
   * Whether the piece's group has subgroups a click could open it into.
   */
  isExpandable: boolean;
  label: string;
  /**
   * The piece's share of every bar shown, as text; empty when a metric does not add up.
   */
  share: string;
  text: string;
  value: number;
}

/**
 * Why there is no chart: loading, unreadable metrics, or no group.
 */
export type ChartsNoticeKind = "empty" | "error" | "loading";

/**
 * A unit of time ticks fall on: label and minutes.
 */
export interface DurationUnit {
  label: string;
  minutes: number;
}

/**
 * A group awaiting a color, with its sibling position and parent's color.
 */
export interface PendingGroup {
  count: number;
  depth: number;
  group: MetricGroup;
  index: number;
  parent: string | undefined;
}
