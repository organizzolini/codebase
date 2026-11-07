// 🏷️ Types

import type { CheckVerdict } from "../check/check.types";

/** The flags the `batch` command reads. */
export interface BatchCommandOptions {
  /** Rewrite each project's glossaries instead of judging them. */
  write?: boolean | undefined;
}

/** One project's verdict, named by the directory it was asked for. */
export interface BatchVerdict extends CheckVerdict {
  readonly directory: string;
}
