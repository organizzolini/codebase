// 🏷️ Types

import type {
  CompiledMeanderFilter,
  MeanderFilterRule,
} from "../filters/meander-filter.types";
import type { Characteristic } from "@codebase/meanderaw-db";

/** A compiled filter, or none. */
export type AggregateFilter = CompiledMeanderFilter | null;

/** The filter a request carries, if the aggregate tables can answer it. */
export type AggregateScope =
  | {
      readonly characteristic: Characteristic;
      readonly kind: "characteristic";
      readonly rule: MeanderFilterRule;
    }
  | { readonly kind: "all" }
  | { readonly kind: "shape"; readonly rules: readonly MeanderFilterRule[] };

/** The rows, columns and lattice that key a shape count. */
export interface AggregateShape {
  readonly columns: number;
  readonly lattice: string;
  readonly rows: number;
}

/** Stored value counts and the total they fall short of. */
export interface ValueTotals {
  readonly stored: Map<number, number>;
  readonly total: number;
}
