// 🏷️ Types

/** One historical drawing, named by its Code. */
export interface CorpusEntry {
  readonly code: string;
  readonly columns: number;
  readonly rows: number;
}
