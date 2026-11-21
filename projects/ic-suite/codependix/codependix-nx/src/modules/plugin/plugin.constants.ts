// ♟️ Constants

/** Glob for `createNodes`; static, so it names only the project file. */
export const PROJECT_CONFIGURATION_GLOB = "**/project.json";

/** Basename that marks a matched file as an actual project description. */
export const PROJECT_CONFIGURATION_FILENAME = "project.json";

/** `globalThis` key for the NestJS context, shared across reloads. */
export const PLUGIN_CONTEXT_GLOBAL_KEY = "__codependixPluginContext";

/** Name this plugin is registered under in a workspace's `nx.json`. */
export const CODEPENDIX_NX_PLUGIN_NAME = "@codependix/nx";

/** Default inferred target name, prefixed to avoid a silent clash. */
export const DEFAULT_GATE_TARGET_NAME = "codependix-bound";

/** Names the missing `configurationPath` in refusals; required, not defaulted. */
export const PLUGIN_OPTION_SURFACE =
  "`configurationPath` option on the @codependix/nx plugin's entry in nx.json";

/** Names the missing `projectConfigurationPath`; required, not defaulted. */
export const PROJECT_PATH_OPTION_SURFACE =
  "`projectConfigurationPath` option on the @codependix/nx plugin's entry in nx.json";

/** Names the missing `projectTsconfigPath`; required, not defaulted. */
export const PROJECT_TSCONFIG_OPTION_SURFACE =
  "`projectTsconfigPath` option on the @codependix/nx plugin's entry in nx.json";

/** Workspace root project, skipped: its closure is the whole workspace. */
export const WORKSPACE_PROJECT_ROOT = ".";

/** The package whose code decides every gate's verdict. */
export const CLI_PACKAGE_NAME = "@codependix/cli";

/** The dependency specifier prefix marking a package of the same workspace. */
export const WORKSPACE_PROTOCOL = "workspace:";

/** Specifier prefixes of this workspace's packages, not registry packages. */
export const LOCAL_DEPENDENCY_PROTOCOLS = [
  "file:",
  "link:",
  "portal:",
  WORKSPACE_PROTOCOL,
] as const;

/** Workspace package files that change a verdict, tests excluded. */
export const TOOL_PACKAGE_GLOBS = [
  "package.json",
  "src/**/!(*.test.*|*.spec.*)",
] as const;

/** Root tsconfig for compiler options, plus its hashed `extends` chain. */
export const WORKSPACE_TSCONFIG_INPUT = "{workspaceRoot}/tsconfig.json";

/** File a package provides when `extends` names only the package. */
export const PACKAGE_TSCONFIG_FILENAME = "tsconfig.json";

/** Warning for a tsconfig base that names no package. */
export const SKIPPED_BASE_REASONS = {
  outside: "it lies outside the workspace",
  unresolved: "it resolves to no file",
} as const;
