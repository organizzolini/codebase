// 🏷️ Types

import type { Ignore } from "ignore";

/** What `discover` is asked to list. */
export interface DiscoverArguments {
  /** The absolute root the run scans. */
  directory: string;
  /** Globs, relative to the root, naming files to leave out. */
  exclude: string[];
  /** Globs, relative to the root, naming the files to keep. */
  include: string[];
  /** Absolute paths always left out: the files the run writes. */
  skip: string[];
}

/**
 * The rules of one `.gitignore`, and the folder they were written in.
 *
 * `base` is relative to the repository root, `""` for the root itself; the
 * patterns only ever see paths relative to it.
 */
export interface IgnoreScope {
  base: string;
  matcher: Ignore;
}

/** Where to read one ignore file from, and the folder it governs. */
export interface ReadIgnoreScopeArguments {
  base: string;
  filePath: string;
}

/** Everything one step of the walk needs to know. */
export interface WalkArguments {
  /** The folder being read, absolute. */
  absoluteDirectory: string;
  /** What the whole walk was asked for. */
  discover: DiscoverArguments;
  /** The repository root every ignore scope is anchored to. */
  repositoryRoot: string;
  scopes: IgnoreScope[];
}
