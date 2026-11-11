// ♟️ Constants

import { z } from "zod";

import type { JupyterResult } from "./jupyter.types";

/** Cell type of a notebook cell holding executable source. */
export const CODE_CELL_TYPE = "code";

/** Cell type of a notebook cell holding prose. */
export const MARKDOWN_CELL_TYPE = "markdown";

/** Notebook cell parts read; a schema, as snake_case keys fail lint. */
export const notebookCellSchema = z.object({
  cell_type: z.string().optional(),
  execution_count: z.number().nullish(),
  outputs: z.array(z.unknown()).optional(),
  source: z.union([z.string(), z.array(z.string())]).optional(),
});

/** The parts of a notebook document this analyzer reads. */
export const notebookDocumentSchema = z.object({
  cells: z.array(notebookCellSchema).optional(),
});

/** Empty metrics used to initialize analyzer state. */
export const EMPTY_JUPYTER_RESULT: JupyterResult = {
  cells: 0,
  classes: 0,
  codeBlocks: 0,
  codeCells: 0,
  codeLines: 0,
  decorators: 0,
  executedCells: 0,
  files: 0,
  functions: 0,
  headings: 0,
  images: 0,
  imports: 0,
  links: 0,
  markdownCells: 0,
  markdownLines: 0,
  maxDepth: 0,
  outputs: 0,
  properties: 0,
  rawCells: 0,
  totalNodes: 0,
};
