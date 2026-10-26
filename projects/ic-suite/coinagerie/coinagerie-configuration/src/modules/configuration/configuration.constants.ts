// ♟️ Constants

import { z } from "zod";

import type { CoinagerieConfiguration } from "./configuration.types";

/**
 * File names a run looks for in its working directory when no `--config` is
 * given, in order of preference.
 */
export const CONFIGURATION_FILE_NAMES = [
  "coinagerie.config.ts",
  "coinagerie.config.mts",
  "coinagerie.config.cts",
  "coinagerie.config.js",
  "coinagerie.config.mjs",
  "coinagerie.config.cjs",
] as const;

/**
 * Globs that together name every file, dot-files included.
 *
 * Three rather than one because `path.matchesGlob` never lets `*` or `**`
 * match a name that starts with a dot: `**` alone would skip `.gitignore` and
 * everything under `.github/`.
 */
export const DEFAULT_INCLUDE = ["**", "**/.*", "**/.*/**"] as const;

const markdownOutputSchema = z.strictObject({
  description: z.string().optional(),
  path: z.string().min(1),
  type: z.literal("markdown"),
});

/**
 * The shape a configuration file's default export must have.
 *
 * Strict at every level, so a misspelled field fails the run instead of being
 * silently ignored.
 */
export const CONFIGURATION_SCHEMA: z.ZodType<CoinagerieConfiguration> =
  z.strictObject({
    exclude: z
      .strictObject({ paths: z.array(z.string()).optional() })
      .optional(),
    include: z.array(z.string()).optional(),
    outputs: z.array(markdownOutputSchema).optional(),
  });
