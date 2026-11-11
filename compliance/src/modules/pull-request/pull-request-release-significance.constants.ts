// ♟️ Constants

import { z } from "zod";

/** Keeps the breaking marker, since it sets the release level. */
export const CONVENTIONAL_SUBJECT_PATTERN =
  /^([a-z][a-z-]*)(?:\(([^()]+)\))?(?<breaking>!)?:\s+(?<subject>\S.*)$/u;

/** What one subject's scope group is split on. */
export const SUBJECT_SCOPE_SEPARATOR_PATTERN = /[,/]/u;

/** Footer marking a breaking change, as `@semantic-release/commit-analyzer` reads it. */
export const BREAKING_CHANGE_FOOTER_PATTERN = /BREAKING[ -]CHANGE:/u;

/** Path to `release.config.cjs`, read fresh so `releaseRules` needs no edit here. */
export const RELEASE_CONFIG_PATH = "configuration/release.config.cjs";

/** The plugin entry in `release.config.cjs` whose options hold `releaseRules`. */
export const COMMIT_ANALYZER_PLUGIN_NAME = "@semantic-release/commit-analyzer";

/** Semver significance of each release level, safe to hard-code. */
export const RELEASE_LEVEL_RANK: Record<string, number> = {
  major: 3,
  minor: 2,
  patch: 1,
};

/** Shape of a `releaseRules` entry, as this check reads it. */
export const releaseRuleSchema = z.object({
  breaking: z.boolean().optional(),
  release: z.union([
    z.literal("major"),
    z.literal("minor"),
    z.literal("patch"),
    z.literal(false),
  ]),
  revert: z.boolean().optional(),
  scope: z.string().optional(),
  type: z.string().optional(),
});

/** The commit-analyzer plugin's options, as much as this check reads. */
export const commitAnalyzerOptionsSchema = z.object({
  releaseRules: z.array(releaseRuleSchema),
});

/** One `release.config.cjs` `plugins` entry: a bare name, or a `[name, options]` tuple. */
export const pluginEntrySchema = z.union([
  z.string(),
  z.tuple([z.string(), z.unknown()]),
]);

/** The shape `release.config.cjs` exports, as much of it as is read here. */
export const releaseConfigSchema = z.object({
  plugins: z.array(pluginEntrySchema),
});

/** The shape a `gh pr view --json title,commits` document is read as. */
export const pullRequestDocumentSchema = z.object({
  commits: z.array(z.unknown()).optional(),
  title: z.string().optional(),
});
