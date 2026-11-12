// ♟️ Constants

import { z } from "zod";

import type {
  CodependixExportTarget,
  CodependixGraphType,
} from "./configuration.types";

/** Raised when the configuration path points to an unsupported file type. */
export class UnknownConfigurationFileTypeError extends Error {
  constructor(filePath: string) {
    super(`Unsupported configuration file type: ${filePath}`);
    this.name = "UnknownConfigurationFileTypeError";
  }
}

/** Graph levels codependix can build. */
export const CODEPENDIX_GRAPH_TYPES = [
  "fileImports",
  "nestjsModules",
  "nxProjects",
] as const satisfies readonly CodependixGraphType[];

/** Export targets a graph type may be configured with, per project. */
export const CODEPENDIX_EXPORT_TARGETS = [
  "both",
  "json",
  "markdown",
  "none",
] as const satisfies readonly CodependixExportTarget[];

/** Extensions the configuration loader can read. */
export const SUPPORTED_CONFIGURATION_EXTENSIONS = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".json",
  ".mjs",
  ".mts",
  ".ts",
]);

/** Project config file names, searched in order: TypeScript before JSON. */
export const CONFIGURATION_FILE_NAMES = [
  "codependix.config.ts",
  "codependix.config.mts",
  "codependix.config.cts",
  "codependix.config.js",
  "codependix.config.mjs",
  "codependix.config.cjs",
  "codependix.config.json",
] as const;

/** Export target applied to a graph type naming none. */
export const DEFAULT_EXPORT_TARGET: CodependixExportTarget = "none";

/** Markdown file an anchor-mode destination writes into when it names none. */
export const DEFAULT_MARKDOWN_PATH = "README.md";

/** Default project list; empty on purpose, never silently widened. */
export const DEFAULT_INCLUDE_GLOBS = [] as const;

/** Upward search root markers; not manifests, which every project has. */
export const REPOSITORY_ROOT_MARKERS = [".git", "pnpm-workspace.yaml"] as const;

/** Separates the entries of a `--projects` or `--tags` argument. */
export const SELECTION_SEPARATOR = ",";

/** Rule selector; empty would silently match every node. */
const boundarySelectorSchema = z
  .object({
    id: z.array(z.string().min(1)).min(1).optional(),
    path: z.array(z.string().min(1)).min(1).optional(),
    project: z.array(z.string().min(1)).min(1).optional(),
    tags: z.array(z.string().min(1)).min(1).optional(),
  })
  .refine(
    (selector) => Object.values(selector).some((value) => value !== undefined),
    {
      message:
        "A selector needs at least one of id, path, project, or tags — otherwise nothing says which nodes it means.",
    },
  );

/** Validates the edge attributes a rule may narrow itself to. */
const boundaryEdgeSelectorSchema = z.object({
  implicit: z.boolean().optional(),
});

/** Validates one declared boundary rule, of either kind. */
const boundaryRuleSchema = z.union([
  z.object({
    edges: boundaryEdgeSelectorSchema.optional(),
    from: boundarySelectorSchema,
    kind: z.enum(["allow", "forbid"]),
    message: z.string().min(1).optional(),
    name: z.string().min(1),
    to: boundarySelectorSchema,
  }),
  z.object({
    kind: z.literal("acyclic"),
    message: z.string().min(1).optional(),
    name: z.string().min(1),
    nodes: boundarySelectorSchema.optional(),
  }),
]);

/** Validates `boundaries.fileImports` rules; cross-language edges cannot exist. */
const fileImportsBoundariesConfigurationSchema = z.object({
  python: z.array(boundaryRuleSchema).optional(),
  typescript: z.array(boundaryRuleSchema).optional(),
});

/** Validates every declared boundary rule, keyed by graph level. */
const boundariesConfigurationSchema = z.object({
  fileImports: fileImportsBoundariesConfigurationSchema.optional(),
  nestjsModules: z.array(boundaryRuleSchema).optional(),
  nxProjects: z.array(boundaryRuleSchema).optional(),
});

/** Validates one graph type's export configuration. */
const graphOutputSchema = z
  .object({
    json: z.object({ path: z.string().min(1) }).optional(),
    markdown: z
      .object({
        anchor: z.string().min(1).optional(),
        path: z.string().min(1).optional(),
      })
      .optional(),
    target: z.enum(CODEPENDIX_EXPORT_TARGETS).optional(),
  })
  .superRefine((output, context) => {
    const target = output.target ?? DEFAULT_EXPORT_TARGET;
    const needsJson = target === "both" || target === "json";
    const needsMarkdown = target === "both" || target === "markdown";

    if (needsJson && output.json === undefined) {
      context.addIssue({
        code: "custom",
        message: `A "${target}" export target needs a json destination.`,
      });
    }

    if (needsMarkdown && output.markdown === undefined) {
      context.addIssue({
        code: "custom",
        message: `A "${target}" export target needs a markdown destination.`,
      });
    }

    if (
      output.markdown !== undefined &&
      output.markdown.anchor === undefined &&
      output.markdown.path === undefined
    ) {
      context.addIssue({
        code: "custom",
        message:
          "A markdown destination needs an anchor, a path, or both — otherwise nothing names where the export goes.",
      });
    }
  });

/** Validates a project's `codependix.config.ts`, keyed by graph type. */
export const codependixProjectConfigurationSchema = z.object({
  fileImports: graphOutputSchema.optional(),
  nestjsModules: graphOutputSchema.optional(),
  nxProjects: graphOutputSchema.optional(),
});

/** Validates the Workspace Graph's exports; all three graph types accepted. */
const workspaceConfigurationSchema = z.object({
  fileImports: graphOutputSchema.optional(),
  nestjsModules: graphOutputSchema.optional(),
  nxProjects: graphOutputSchema.optional(),
});

/** Validates how the NestJS module graph finds each application's root module. */
const nestjsModulesConfigurationSchema = z.object({
  rootModules: z
    .record(z.string(), z.object({ export: z.string(), file: z.string() }))
    .optional(),
});

/** Validates a configuration file; unknown keys are stripped, not rejected. */
export const codependixConfigurationSchema = z.object({
  boundaries: boundariesConfigurationSchema.optional(),
  exclude: z.array(z.string()).optional(),
  include: z.array(z.string()).optional(),
  nestjsModules: nestjsModulesConfigurationSchema.optional(),
  projectGraph: z.string().optional(),
  workspace: workspaceConfigurationSchema.optional(),
});

/** `--check boundaries` fails the run on a rule-breaking edge. */
export const CHECK_BOUNDARIES = "boundaries";

/** `--check reports` fails the run on a stale export. */
export const CHECK_REPORTS = "reports";

/** Values `--check` accepts; `reports` matches the sibling tools' term. */
export const CHECK_NAMES = [CHECK_BOUNDARIES, CHECK_REPORTS];

/** How a `--check` value is written: one comma-separated set, no spaces needed. */
export const CHECK_SEPARATOR = ",";

/** Choices offered without a mode; never defaulted, avoiding silent no-ops. */
export const RUN_MODE_CHOICES = [
  CHECK_BOUNDARIES,
  CHECK_REPORTS,
  "write",
] as const;

/** Name a prompt uses for the value, in error messages. */
export const RUN_MODE_SUBJECT = "A run mode (--check or --write)";

// 🚨 Errors

/** Raised when an explicitly named configuration file does not exist. */
export class ConfigurationFileNotFoundError extends Error {
  constructor(filePath: string) {
    super(`Configuration file not found: ${filePath}`);
    this.name = "ConfigurationFileNotFoundError";
  }
}

/**
 * Raised when no main configuration path was given.
 *
 * Names the surface the path should have come through — the command-line
 * flag, the executor option, or the plugin option — so the message tells the
 * caller which setting to fix rather than only that one is missing.
 */
export class ConfigurationPathRequiredError extends Error {
  constructor(surface: string) {
    super(
      `A configuration path is required, but the ${surface} named none: give it the path of the codependix configuration file.`,
    );
    this.name = "ConfigurationPathRequiredError";
  }
}
