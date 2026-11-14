// 🏷️ Types

import type { MeanderFilterOperator } from "./meander-filter-rule.entities";
import type { Characteristic } from "@codebase/meanderaw-db";

/** A boolean SQL expression over the meanders table, aliased `meander`. */
export interface CompiledMeanderFilter {
  readonly parameters: Record<string, unknown>;
  readonly where: string;
}

/** What a compile pass carries: the catalog and bound parameters. */
export interface MeanderFilterContext {
  readonly catalog: ReadonlyMap<string, Characteristic>;
  readonly driver: MeanderFilterRule | null;
  readonly parameters: Record<string, unknown>;
}

/** Rules and nested groups joined under one combinator, validated. */
export interface MeanderFilterGroup {
  combinator: "and" | "or";
  groups: MeanderFilterGroup[];
  rules: MeanderFilterRule[];
}

/** The kind of value a field holds. */
export type MeanderFilterKind = "boolean" | "number" | "text";

/** One validated condition of a filter. */
export interface MeanderFilterRule {
  field: string;
  flag: boolean | null;
  numbers: number[];
  operator: MeanderFilterOperator;
  text: null | string;
}
