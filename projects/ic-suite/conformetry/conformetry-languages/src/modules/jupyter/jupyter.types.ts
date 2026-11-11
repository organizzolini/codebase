// 🏷️ Types

/** One notebook cell. `source` keeps newlines, as Jupyter stores it. */
export interface NotebookCell {
  readonly cell_type?: unknown;
  readonly source?: unknown;
}

/** The cell kinds this validator understands. */
export type NotebookCellKind = "code" | "markdown" | "raw";

/** Template and instance cells of one kind, in order. */
export interface PairedCells {
  readonly index: number;
  readonly instanceSource: string;
  readonly kind: NotebookCellKind;
  readonly templateSource: string;
}

/** A notebook reduced to the parts that are validated. */
export interface ParsedNotebook {
  readonly cells: NotebookCell[];
}
