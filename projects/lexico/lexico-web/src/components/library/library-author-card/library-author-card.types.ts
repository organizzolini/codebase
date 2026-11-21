import type { LibraryMatchRow } from "../library-grid/library-grid.types";

// 🏷️ Types

/** Several fields' values as one line, with their match ranges moved to fit it. */
export interface LibraryJoinedLine {
  matches: LibraryMatchRow[];
  value: string;
}
