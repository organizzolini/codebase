// 🏷️ Types

/**
 * One historical drawing, kept as the Code that names it. See
 * `HISTORICAL_CORPUS` for the set.
 */
export interface CorpusEntry {
  readonly code: string;
  readonly columns: number;
  readonly rows: number;
}
