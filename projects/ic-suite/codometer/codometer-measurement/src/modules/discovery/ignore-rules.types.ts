// 🏷️ Types

import type { Ignore } from "ignore";

/** Arguments accepted when building a rule set from patterns already in hand. */
export interface CreateIgnoreScopeArguments {
  directory: string;
  patterns: string[];
}

/**
 * A gitignore rule set and the directory its patterns are relative to, so `/output` claims that project's `output`.
 */
export interface IgnoreScope {
  /** Directory the patterns are relative to, `/`-separated from the walk root. `""` is the root itself. */
  directory: string;
  matcher: Ignore;
}

/** Arguments accepted when reading a rule set out of a gitignore-syntax file. */
export interface ReadIgnoreScopeArguments {
  directory: string;
  filePath: string;
}
