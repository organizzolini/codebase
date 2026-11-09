// ♟️ Constants

import { z } from "zod";

import type {
  CallidescopeConfiguration,
  CallidescopeProjectConfiguration,
  CallidescopeProjectEntryPoints,
  CallidescopeProjectLimits,
  CallidescopeProjectWriteConfiguration,
  CallidescopeWriteConfiguration,
  ProjectFieldPermission,
  RenderMarkdownOutput,
  WriteMarkdownOutput,
} from "./configuration.types";

/**
 * Configuration file names, in search order. TypeScript comes first, for its type checking.
 */
export const CONFIGURATION_FILE_NAMES = [
  "callidescope.config.ts",
  "callidescope.config.mts",
  "callidescope.config.cts",
  "callidescope.config.js",
  "callidescope.config.mjs",
  "callidescope.config.cjs",
  "callidescope.config.json",
  "callidescope.config.jsonc",
] as const;

/** Extensions the configuration loader knows how to read. */
export const SUPPORTED_CONFIGURATION_EXTENSIONS = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".json",
  ".jsonc",
  ".mjs",
  ".mts",
  ".ts",
]);

/**
 * Files that mark a repository root. `package.json` is absent: every package
 * has one, so it would stop the walk early.
 */
export const REPOSITORY_ROOT_MARKERS = [".git", "pnpm-workspace.yaml"] as const;

/** Directories no repository wants traced, kept out even when unmentioned. */
export const DEFAULT_EXCLUDE_GLOBS = [
  "**/.conformetry/**",
  "**/.nx/**",
  "**/coverage/**",
  "**/dist/**",
  "**/node_modules/**",
  "**/output/**",
] as const;

/** Frames a call stack may hold before it is reported, counting the entry point. */
export const DEFAULT_MAXIMUM_DEPTH = 6;

/** Decorators whose methods a framework invokes, making them stack roots. */
export const DEFAULT_ENTRY_POINT_DECORATORS = [
  "Command",
  "Cron",
  "Delete",
  "Get",
  "Mutation",
  "OnEvent",
  "Option",
  "Patch",
  "Post",
  "Put",
  "Query",
  "ResolveField",
  "SubscribeMessage",
] as const;

/** Spaces used to indent the JSON report. */
export const DEFAULT_JSON_INDENTATION = 2;

/** Every format a run may print, in the order a prompt offers them. */
export const CALLIDESCOPE_OUTPUT_FORMATS = [
  "markdown",
  "mermaid",
  "json",
] as const;

/** What a run prints to standard output when nothing says otherwise. */
export const DEFAULT_OUTPUT_FORMAT = "markdown";

/** Heading the section embedded in a project README is written under. */
export const DEFAULT_PROJECT_README_HEADING = "## 🔭 Callidescope";

/** Heading of a whole-run markdown block; level one, since the block usually fills its file. */
export const DEFAULT_RUN_HEADING = "# 🔭 Callidescope";

/** Stacks a README section shows before the rest fold into a disclosure. */
export const DEFAULT_PREVIEW_COUNT = 3;

/** Opening anchor of the generated markdown block. */
export const DEFAULT_MARKDOWN_START_MARKER = "<!-- callidescope:start -->";

/** Closing anchor of the generated markdown block. */
export const DEFAULT_MARKDOWN_END_MARKER = "<!-- callidescope:end -->";

// 🔒 Project Configuration

/** Joins names into an English list; `Intl.ListFormat` needs no guard for the empty or single-name case. */
const FIELD_LIST_FORMAT = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction",
});

/** Names a field contributes to the permitted set; a member-classified field yields dotted names such as `write.markdown`. */
const readPermittedNames = (args: {
  field: string;
  permission: ProjectFieldPermission | Record<string, ProjectFieldPermission>;
}): string[] => {
  if (typeof args.permission === "string") {
    return args.permission === "permitted" ? [args.field] : [];
  }

  return Object.entries(args.permission)
    .filter(([, member]) => member === "permitted")
    .map(([member]) => `${args.field}.${member}`);
};

/**
 * Whether a project may set each run-level field. Keyed by the interface, so new fields must be classified.
 */
export const PROJECT_CONFIGURATION_FIELD_PERMISSIONS = {
  directories: "forbidden",
  entryPoints: "permitted",
  exclude: "permitted",
  excludeCallees: "forbidden",
  excludeFrom: "forbidden",
  limits: "permitted",
  write: {
    json: "forbidden",
    markdown: "permitted",
    mermaid: "permitted",
  },
} as const satisfies Record<
  keyof CallidescopeConfiguration,
  | ProjectFieldPermission
  | Record<keyof CallidescopeWriteConfiguration, ProjectFieldPermission>
>;

/** Fields classified a member at a time rather than whole. Derived, so it cannot drift from the permissions record. */
export const PROJECT_CONFIGURATION_NESTED_FIELD_NAMES = new Set(
  Object.entries(PROJECT_CONFIGURATION_FIELD_PERMISSIONS)
    .filter(([, permission]) => typeof permission !== "string")
    .map(([field]) => field),
);

/** Names a project may set, looked up by a field name read from a file. Unknown names are refused. */
export const PROJECT_CONFIGURATION_PERMITTED_FIELD_NAMES = new Set(
  Object.entries(PROJECT_CONFIGURATION_FIELD_PERMISSIONS).flatMap(
    ([field, permission]) => readPermittedNames({ field, permission }),
  ),
);

/** Permitted field names printed in a refusal, derived from the permissions so the two cannot disagree. */
export const PROJECT_CONFIGURATION_PERMITTED_FIELDS = FIELD_LIST_FORMAT.format(
  PROJECT_CONFIGURATION_PERMITTED_FIELD_NAMES,
);

/** Names a project's configuration must set, written out since types vanish at runtime. Checked for presence, never emptiness. */
export const PROJECT_CONFIGURATION_REQUIRED_FIELDS = {
  entryPoints: [
    "addresses",
    "decorators",
    "includeExportedFunctions",
    "includeOrphans",
    "includeTests",
  ],
  exclude: [],
  limits: ["maximumBreadth", "maximumDepth"],
  write: ["markdown", "mermaid"],
} as const satisfies Record<
  keyof CallidescopeProjectConfiguration,
  readonly string[]
> & {
  entryPoints: readonly (keyof CallidescopeProjectEntryPoints)[];
  exclude: readonly [];
  limits: readonly (keyof CallidescopeProjectLimits)[];
  write: readonly (keyof CallidescopeProjectWriteConfiguration)[];
};

/** Raised when a configuration file has an extension nothing can read. */
export class UnknownConfigurationFileTypeError extends Error {
  constructor(filePath: string) {
    super(`Unknown configuration file type: ${filePath}`);
    this.name = "UnknownConfigurationFileTypeError";
  }
}

/** Accepts any function, since Zod cannot describe a callback and parsing one would wrap it. */
const callbackSchema = <TCallback>(): z.ZodType<TCallback> =>
  z.custom<TCallback>((value) => typeof value === "function", {
    message: "Expected a function",
  });

/** The two limits a configuration may declare; strict, so an unknown limit is refused rather than dropped. */
const limitsSchema = z
  .strictObject({
    maximumBreadth: z.number().int().positive().optional(),
    maximumDepth: z.number().int().positive().optional(),
  })
  .optional();

const entryPointsSchema = z
  .strictObject({
    addresses: z.array(z.string()).optional(),
    decorators: z.array(z.string()).optional(),
    includeExportedFunctions: z.boolean().optional(),
    includeOrphans: z.boolean().optional(),
    includeTests: z.boolean().optional(),
  })
  .optional();

/** A marker-delimited block in a markdown file, shared by the `markdown` and `mermaid` destinations. */
const markdownDestinationSchema = z
  .strictObject({
    description: z.string().optional(),
    endMarker: z.string().optional(),
    heading: z.string().optional(),
    path: z.string(),
    previewCount: z.number().int().nonnegative().optional(),
    render: callbackSchema<RenderMarkdownOutput>().optional(),
    startMarker: z.string().optional(),
    writeBlock: callbackSchema<WriteMarkdownOutput>().optional(),
  })
  .optional();

const writeSchema = z
  .strictObject({
    json: z
      .strictObject({
        indentation: z.number().int().nonnegative().optional(),
        path: z.string(),
      })
      .optional(),
    markdown: markdownDestinationSchema,
    mermaid: markdownDestinationSchema,
  })
  .optional();

/** Validates a callidescope configuration file; strict at every level, so unknown fields are refused, not stripped. */
export const callidescopeConfigurationSchema = z.strictObject({
  directories: z.array(z.string()).optional(),
  entryPoints: entryPointsSchema,
  exclude: z.array(z.string()).optional(),
  excludeCallees: z.array(z.string()).optional(),
  excludeFrom: z.array(z.string()).optional(),
  /** Renamed to `excludeCallees`. */
  ignoreCallees: z.never().optional(),
  limits: limitsSchema,
  /** Renamed to `write`. */
  output: z.never().optional(),
  write: writeSchema,
});

// 🚨 Errors

/** Raised when an explicitly named configuration file does not exist. */
export class ConfigurationFileNotFoundError extends Error {
  constructor(filePath: string) {
    super(`Configuration file not found: ${filePath}`);
    this.name = "ConfigurationFileNotFoundError";
  }
}

/**
 * Raised when a project's own configuration file cannot be read or parsed.
 *
 * Names the project rather than only the path, because a run resolves a file
 * per project and the failure has to say which one to go and fix. The original
 * failure is kept as `cause` so nothing a reader would need is thrown away.
 */
export class ProjectConfigurationError extends Error {
  constructor(args: {
    cause: unknown;
    configurationPath: string;
    project: string;
  }) {
    const reason =
      args.cause instanceof Error ? args.cause.message : "It could not be read";

    super(
      `Failed to read the callidescope configuration for ${args.project} at ${args.configurationPath}: ${reason}`,
      { cause: args.cause },
    );
    this.name = "ProjectConfigurationError";
  }
}

/**
 * Raised when a project's own configuration sets a field only the workspace
 * configuration may set.
 *
 * Names the project, the offending field, and the four fields a project
 * configuration may set, so the message is actionable without opening a
 * README.
 */
export class ProjectConfigurationFieldNotPermittedError extends Error {
  constructor(args: { field: string; project: string }) {
    super(
      `${args.project} sets ${args.field}, which only the workspace configuration may set. A project configuration may set ${PROJECT_CONFIGURATION_PERMITTED_FIELDS}.`,
    );
    this.name = "ProjectConfigurationFieldNotPermittedError";
  }
}

/**
 * Raised when a traced project's configuration leaves a field out.
 *
 * Names the field as a reader has to type it to fix the file — `write.mermaid`
 * rather than `write` — and points at the spread that supplies every field a
 * project has no opinion about, because the fix is almost always that one line
 * rather than a field written out by hand.
 */
export class ProjectConfigurationIncompleteError extends Error {
  constructor(args: { field: string; project: string }) {
    super(
      `${args.project} leaves ${args.field} out of its callidescope configuration, which must be complete. Spread the workspace's projectDefaults and override what this project means to.`,
    );
    this.name = "ProjectConfigurationIncompleteError";
  }
}

/**
 * Raised when a traced project has no configuration file at all.
 *
 * A project that is traced is judged, and what it is judged by is written in
 * its own file or nowhere. Inheriting everything in silence is the arrangement
 * this replaces: it left a project's numbers resolvable only by reading two
 * files and knowing which one won.
 */
export class ProjectConfigurationMissingError extends Error {
  constructor(project: string) {
    super(
      `${project} is traced but has no callidescope.config.ts. Every traced project declares its own, spreading the workspace's projectDefaults and overriding what it means to.`,
    );
    this.name = "ProjectConfigurationMissingError";
  }
}
