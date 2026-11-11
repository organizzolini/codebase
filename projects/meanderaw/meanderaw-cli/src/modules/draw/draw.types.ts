// 🏷️ Types

import type { MeanderRecord, MeanderShape } from "../database/database.types";

/** One meander's `--rows`, `--columns`, and `--code` values. */
export interface CodeDrawingOptions {
  readonly code: string;
  readonly columns?: number | undefined;
  readonly repeats?: number | undefined;
  readonly rows?: number | undefined;
}

/** Parsed `draw` options; all optional, code options checked together. */
export interface DrawCommandOptions {
  code?: string;
  columns?: number;
  rows?: number;
}

/** A worker's records or failure for one {@link DrawWorkerTask}. */
export type DrawWorkerReply =
  | { readonly error: string }
  | { readonly records: readonly MeanderRecord[] };

/** A batch of orbit minima for a worker to draw. */
export interface DrawWorkerTask {
  readonly masks: readonly number[];
  readonly shape: MeanderShape;
}
