// 🏷️ Types

import type { Ignore } from "ignore";

/** Arguments accepted when building a rule set from patterns already in hand. */
export interface CreateIgnoreScopeArguments {
  base?: string;
  directory: string;
  patterns: string[];
}

/** `.gitignore` rules and the directory their patterns are relative to. */
export interface IgnoreScope {
  /** Path from an ancestor scope's folder down to the walk root. */
  base?: string;
  /** Directory the patterns are relative to, `/`-separated from the walk root. `""` is the root itself. */
  directory: string;
  matcher: Ignore;
}

/** Arguments accepted when reading a rule set out of a gitignore-syntax file. */
export interface ReadIgnoreScopeArguments {
  base?: string;
  directory: string;
  filePath: string;
}
