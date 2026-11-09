// 🏷️ Types

/**
 * Options for the `changes` command. Typed loosely because a flag given without a value arrives as `true`, not text.
 */
export interface ChangesCommandOptions {
  baseline?: unknown;
  baselineUrl?: unknown;
  directory?: unknown;
  markdown?: unknown;
  output?: unknown;
}
