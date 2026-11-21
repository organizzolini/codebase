// 🏷️ Types

/** One directory's verdict, named by the directory it was asked for. */
export interface BatchVerdict {
  readonly directory: string;
  readonly ok: boolean;
  /** What failed the run, as plain lines; empty when it passed. */
  readonly report: string;
}
