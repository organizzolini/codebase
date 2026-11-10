// ♟️ Constants

/**
 * The edge budget the corpus was extracted against; entries past it are hardcoded rows.
 * Fixed, not the draw run's budget.
 */
export const HISTORICAL_CORPUS_EDGE_BUDGET = 16;

// 🚨 Errors

/**
 * Thrown when ingesting a corpus entry fails because its Code already
 * belongs to a row committed to the database — an enumerated row, or another
 * corpus entry ingested earlier in the same draw run — rather than being
 * silently overwritten.
 */
export class DuplicateCorpusCodeError extends Error {
  constructor(code: string, cause: unknown) {
    super(
      `hardcoded entry "${code}" collided with a Code already committed to the database`,
      { cause },
    );
    this.name = "DuplicateCorpusCodeError";
  }
}
