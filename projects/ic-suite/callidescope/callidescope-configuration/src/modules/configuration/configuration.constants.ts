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

/** File names in search order. TypeScript first, for type checking. */
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

/** Repository root markers. `package.json` is absent: every package has one. */
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

/** Frames a call stack may hold, counting its entry point. */
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

/** Every format a run prints, in prompt order. */
export const CALLIDESCOPE_OUTPUT_FORMATS = [
  "markdown",
  "mermaid",
  "json",
] as const;

/** What a run prints to standard output when nothing says otherwise. */
export const DEFAULT_OUTPUT_FORMAT = "markdown";

/** Heading the section embedded in a project README is written under. */
export const DEFAULT_PROJECT_README_HEADING = "## 🔭 Callidescope";

/** Whole-run markdown heading, level one: the block fills its file. */
export const DEFAULT_RUN_HEADING = "# 🔭 Callidescope";

/** Stacks a README section shows before the rest fold into a disclosure. */
export const DEFAULT_PREVIEW_COUNT = 3;

/** Opening anchor of the generated markdown block. */
export const DEFAULT_MARKDOWN_START_MARKER = "<!-- callidescope:start -->";

/** Closing anchor of the generated markdown block. */
export const DEFAULT_MARKDOWN_END_MARKER = "<!-- callidescope:end -->";

// 🔒 Project Configuration

/** English list joiner; `Intl.ListFormat` needs no empty-case guard. */
const FIELD_LIST_FORMAT = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction",
});

/** Names a field adds; member fields are dotted, as `write.markdown`. */
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

/** Whether a project may set each field. Keyed by interface. */
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

/** Fields classified per member. Derived, so it cannot drift. */
export const PROJECT_CONFIGURATION_NESTED_FIELD_NAMES = new Set(
  Object.entries(PROJECT_CONFIGURATION_FIELD_PERMISSIONS)
    .filter(([, permission]) => typeof permission !== "string")
    .map(([field]) => field),
);

/** Settable names by field; unknown names are refused. */
export const PROJECT_CONFIGURATION_PERMITTED_FIELD_NAMES = new Set(
  Object.entries(PROJECT_CONFIGURATION_FIELD_PERMISSIONS).flatMap(
    ([field, permission]) => readPermittedNames({ field, permission }),
  ),
);

/** Refusal-printed field names, derived so they cannot disagree. */
export const PROJECT_CONFIGURATION_PERMITTED_FIELDS = FIELD_LIST_FORMAT.format(
  PROJECT_CONFIGURATION_PERMITTED_FIELD_NAMES,
);

/** Required names, listed since types vanish at runtime. Presence only. */
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

/** Any function: Zod cannot describe callbacks, and parsing wraps them. */
const callbackSchema = <TCallback>(): z.ZodType<TCallback> =>
  z.custom<TCallback>((value) => typeof value === "function", {
    message: "Expected a function",
  });

/** The two declarable limits. Strict: unknown limits are refused. */
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

/** Marker-delimited markdown block, shared by `markdown` and `mermaid` destinations. */
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

/** Validates a configuration file; strict, so unknown fields are refused. */
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
 * Names the project, not only the path, since a run resolves a file per project. The original failure is kept as `cause`.
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
 * Names the field as a reader types it to fix the file, such as `write.mermaid`. The fix is usually the spread that supplies every field a project has no opinion about.
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
 * A traced project is judged by what its own file says, or by nothing. Inheriting silently, which this replaces, left numbers resolvable only by reading two files.
 */
export class ProjectConfigurationMissingError extends Error {
  constructor(project: string) {
    super(
      `${project} is traced but has no callidescope.config.ts. Every traced project declares its own, spreading the workspace's projectDefaults and overriding what it means to.`,
    );
    this.name = "ProjectConfigurationMissingError";
  }
}
