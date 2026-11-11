// 🏷️ Types

/** The flags the `collect` command reads. */
export interface CollectCommandOptions {
  /** Fail when any destination's words disagree with the code's. */
  check?: boolean | undefined;
  /** A configuration file, relative to the working directory. */
  config?: string | undefined;
  /** Replaces the description of every markdown destination. */
  description?: string | undefined;
  /** Replaces the configuration's `exclude.paths`. */
  excludePaths?: string[] | undefined;
  /** The format printed to standard output when no destination is checked or written. */
  format?: string | undefined;
  /** Replaces the configuration's `include`. */
  include?: string[] | undefined;
  /** A JSON destination replacing the configuration's `outputs`. */
  outputJson?: string | undefined;
  /** A markdown destination replacing the configuration's `outputs`. */
  outputMarkdown?: string | undefined;
  /** Rewrite every destination to hold exactly the code's words. */
  write?: boolean | undefined;
}

/** Mode for the vocabulary: print, check, or write it. */
export type CollectMode = "check" | "print" | "write";
