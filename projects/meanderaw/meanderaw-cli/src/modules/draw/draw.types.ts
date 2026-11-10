// 🏷️ Types

import type { MeanderRecord, MeanderShape } from "../database/database.types";

/**
 * The `--rows`, `--columns`, and `--code` values of one meander, checked
 * together by `DrawCommand` before narrowing.
 */
export interface CodeDrawingOptions {
  readonly code: string;
  readonly columns?: number | undefined;
  readonly repeats?: number | undefined;
  readonly rows?: number | undefined;
}

/**
 * Parsed `draw` options. Every field is optional: `draw` with no flag draws
 * every meander, and the three code options are checked together.
 */
export interface DrawCommandOptions {
  code?: string;
  columns?: number;
  rows?: number;
}

/** A worker thread's answer to one {@link DrawWorkerTask}: its records, or why it could not draw them. */
export type DrawWorkerReply =
  | { readonly error: string }
  | { readonly records: readonly MeanderRecord[] };

/** A batch of one shape's orbit minima, sent to a worker thread to draw. */
export interface DrawWorkerTask {
  readonly masks: readonly number[];
  readonly shape: MeanderShape;
}
