// 🏷️ Types

import type { environmentSchema } from "../../meanderaw-cli.constants";
import type { z } from "zod";

/** An edge's grid, row, and column within an `EdgesDraft`. */
export interface EdgeAddress {
  readonly column: number;
  readonly grid: readonly boolean[][];
  readonly row: number;
}

/** A meander the draw run found: its Code and shape. */
export interface EnumeratedMeander {
  readonly code: string;
  readonly columns: number;
  readonly rows: number;
}

/** Validated environment variables bounding a draw run. */
export type Environment = z.infer<typeof environmentSchema>;
