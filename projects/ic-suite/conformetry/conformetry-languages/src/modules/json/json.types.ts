// 🏷️ Types

import type { ConformetryDifference } from "@conformetry/core";

/** Arguments for comparing two JSON values. */
export interface CompareJsonArguments {
  readonly instanceValue: JsonValue;
  readonly language: JsonComparisonLanguage;
  readonly pathSegments?: JsonPathSegment[];
  readonly templateValue: JsonValue;
}

/** What structurally comparing two JSON values produced. */
export interface JsonComparison {
  /** What each placeholder value stood for — see `DocumentValidationResult`. */
  readonly captures?: Readonly<Record<string, string>>;
  readonly differences: ConformetryDifference[];
  /** Template nodes the walk weighed the instance against. */
  readonly totalWeight: number;
}

/**
 * Which validator asks for the comparison. The walk is shared between JSON and
 * Jupyter, so differences are attributed to whichever raised them.
 */
export type JsonComparisonLanguage = "json" | "python";

/** One step of a JSON path: an object key or an array index. */
export type JsonPathSegment = number | string;

/** Any JSON value, used when structurally comparing two documents. */
export type JsonValue =
  | boolean
  | JsonValue[]
  | null
  | number
  | string
  | { [key: string]: JsonValue };
