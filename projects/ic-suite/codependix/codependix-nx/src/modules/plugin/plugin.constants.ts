// ♟️ Constants

/**
 * Glob `createNodes` matches. It includes codependix configurations, or the
 * daemon keeps inference from before one existed.
 */
export const PROJECT_CONFIGURATION_GLOB =
  "**/{project.json,codependix.config.*}";

/** Basename that marks a matched file as an actual project description. */
export const PROJECT_CONFIGURATION_FILENAME = "project.json";

/**
 * Cache input for the project's own codependix configuration. Project-relative,
 * so one project's edit does not invalidate every gate.
 */
export const PROJECT_CONFIGURATION_INPUT = "{projectRoot}/codependix.config.*";

/**
 * Key the plugin's NestJS context is cached under on `globalThis`, so loading
 * this module twice still yields one context per process.
 */
export const PLUGIN_CONTEXT_GLOBAL_KEY = "__codependixPluginContext";

/** Name this plugin is registered under in a workspace's `nx.json`. */
export const CODEPENDIX_NX_PLUGIN_NAME = "@codependix/nx";

/**
 * Inferred gate target name, used when the registration names none. Prefixed,
 * unlike callidescope's `gate`, to avoid a silent clash.
 */
export const DEFAULT_GATE_TARGET_NAME = "codependix-bound";

/**
 * Names the missing `configurationPath` in the refusal. Required rather than
 * defaulted, so a workspace states its configuration's location.
 */
export const PLUGIN_OPTION_SURFACE =
  "`configurationPath` option on the @codependix/nx plugin's entry in nx.json";

/**
 * Root of the workspace-level project, which inference skips: its dependency
 * closure is the whole workspace, not a per-project gate.
 */
export const WORKSPACE_PROJECT_ROOT = ".";

/** The package whose code decides every gate's verdict. */
export const CLI_PACKAGE_NAME = "@codependix/cli";

/** The dependency specifier prefix marking a package of the same workspace. */
export const WORKSPACE_PROTOCOL = "workspace:";

/**
 * Dependency specifier prefixes for packages from this workspace's files, not
 * a registry. Nx's graph need not hold them as external nodes.
 */
export const LOCAL_DEPENDENCY_PROTOCOLS = [
  "file:",
  "link:",
  "portal:",
  WORKSPACE_PROTOCOL,
] as const;

/**
 * Files of a workspace package that change a gate's verdict. Tests are excluded
 * inside the positive glob, as Nx ignores negated inputs.
 */
export const TOOL_PACKAGE_GLOBS = [
  "package.json",
  "src/**/!(*.test.*|*.spec.*)",
] as const;

/**
 * The root tsconfig the loader reads for compiler options. Its `extends` chain
 * is hashed too.
 */
export const WORKSPACE_TSCONFIG_INPUT = "{workspaceRoot}/tsconfig.json";

/**
 * The file a package base provides when `extends` names only the package.
 * Manifest `tsconfig` fields are not read.
 */
export const PACKAGE_TSCONFIG_FILENAME = "tsconfig.json";

/**
 * Why a tsconfig base that names no package was skipped, as the warning
 * naming it phrases it.
 */
export const SKIPPED_BASE_REASONS = {
  outside: "it lies outside the workspace",
  unresolved: "it resolves to no file",
} as const;
