// 🏷️ Types

/** What `write` did with the projects that lacked a link. */
export interface LinkOutcome {
  /** Projects whose `CLAUDE.md` is a regular file `write` will not overwrite. */
  readonly refused: string[];
}
