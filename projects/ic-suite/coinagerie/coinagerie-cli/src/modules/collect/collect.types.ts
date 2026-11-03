// 🏷️ Types

/** The flags the `collect` command reads. */
export interface CollectCommandOptions {
  /** Fail when any destination's words disagree with the code's. */
  check?: boolean | undefined;
  /** A configuration file, relative to the working directory. */
  config?: string | undefined;
  /** Rewrite every destination to hold exactly the code's words. */
  write?: boolean | undefined;
}

/**
 * What one run does with the vocabulary: print it, check every destination
 * against it, or write it into every destination.
 */
export type CollectMode = "check" | "print" | "write";
