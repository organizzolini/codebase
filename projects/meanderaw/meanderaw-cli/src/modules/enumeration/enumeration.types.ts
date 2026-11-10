// 🏷️ Types

import type { environmentSchema } from "../../meanderaw-cli.constants";
import type { z } from "zod";

/** Where one edge sits in an `EdgesDraft`: the grid that holds it, and its row and column within that grid. */
export interface EdgeAddress {
  readonly column: number;
  readonly grid: readonly boolean[][];
  readonly row: number;
}

/**
 * One meander the draw run found: its Code and the shape it is read at.
 */
export interface EnumeratedMeander {
  readonly code: string;
  readonly columns: number;
  readonly rows: number;
}

/**
 * Inferred type of the validated environment variables, read to bound a
 * draw run by edge budget, rows, and columns.
 */
export type Environment = z.infer<typeof environmentSchema>;
