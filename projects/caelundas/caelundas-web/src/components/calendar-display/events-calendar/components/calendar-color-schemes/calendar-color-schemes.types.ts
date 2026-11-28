import type { CalendarEventRecord } from "../calendar-loader/calendar-records.types";

// 🏷️ Types

/**
 * One color of a scheme and what it stands for.
 */
export interface ColorLegendEntry {
  color: string;
  /**
   * How many tags above it are colored, so a nested color indents.
   */
  depth: number;
  key: string;
  label: string;
}

/**
 * The legend's colors, and the color an event gets.
 */
export interface ColorScheme {
  colorOf: (event: CalendarEventRecord) => null | string;
  legend: readonly ColorLegendEntry[];
}

/**
 * How one grouping level colors events.
 */
export interface LevelPainter {
  colorOf: (event: CalendarEventRecord) => null | string;
  legend: ColorLegendEntry[];
  tops: number;
}

/**
 * A color as oklch lightness, chroma and hue.
 */
export interface OklchColor {
  chroma: number;
  hue: number;
  lightness: number;
}

/**
 * What painting one level's tags shares.
 */
export interface PaintContext {
  colors: Map<string, { color: string; depth: number }>;
  legend: ColorLegendEntry[];
  offset: number;
  tops: ReadonlySet<string>;
  used: number;
}

/**
 * One tag to paint, and where it sits among its siblings.
 */
export interface PaintStep {
  depth: number;
  index: number;
  node: TagNode;
  parent: string | undefined;
  siblings: number;
}

/**
 * A tag with the tags directly beneath it.
 */
export interface TagNode {
  children: TagNode[];
  depth: number;
  id: string;
  label: string;
}
