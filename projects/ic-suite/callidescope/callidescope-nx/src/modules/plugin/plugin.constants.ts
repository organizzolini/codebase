// ♟️ Constants

/** Glob `createNodes` matches. Nx fixes it before reading options, so it names no configuration file. */
export const PROJECT_CONFIGURATION_GLOB = "**/project.json";

/**
 * Raised when the registration and the workspace configuration name different project configuration paths.
 */
export class ProjectConfigurationPathMismatchError extends Error {
  constructor(args: {
    configurationPath: string;
    declared: string | undefined;
    registered: string;
  }) {
    super(
      `The nx.json registration sets projectConfigurationPath to "${args.registered}", but ${args.configurationPath} sets ${args.declared === undefined ? "none" : `"${args.declared}"`}. Both must name the same path.`,
    );
    this.name = "ProjectConfigurationPathMismatchError";
  }
}

/**
 * Raised when the registration and the workspace configuration name different project tsconfig paths.
 */
export class ProjectTsconfigPathMismatchError extends Error {
  constructor(args: {
    configurationPath: string;
    declared: string | undefined;
    registered: string;
  }) {
    super(
      `The nx.json registration sets projectTsconfigPath to "${args.registered}", but ${args.configurationPath} sets ${args.declared === undefined ? "none" : `"${args.declared}"`}. Both must name the same path.`,
    );
    this.name = "ProjectTsconfigPathMismatchError";
  }
}

/** `globalThis` key for the plugin context; one per process. */
export const PLUGIN_CONTEXT_GLOBAL_KEY = "__callidescopePluginContext";

/** Judged project's files were never read. Gates fail; traces pass. */
export const reportUnreadProjects = (projectNames: readonly string[]): string =>
  [
    "## Read nothing of its own (0 files)",
    "",
    `This run judged ${projectNames.length === 1 ? "a project" : "projects"} whose own code it never read:`,
    "",
    ...projectNames.map((projectName) => `- \`${projectName}\``),
    "",
    "A `gate` fails on this and a `trace` does not: a gate that never looked",
    "cannot tell a clean project from an unread one, where a trace decides",
    "nothing and is a report for a reader to open. The run itself was not",
    "empty — the dependencies it traced were read — so only the judged",
    "project's own sources went missing.",
    "",
    "Check `exclude` and `excludeFrom` in the workspace callidescope",
    "configuration and `exclude` in the project's own configuration for a",
    "pattern matching everything that project holds, and check that the",
    "project still holds sources its tsconfig includes.",
  ].join("\n");

/** No code read by a gate's run. Failing beats passing. */
export const EMPTY_TRACE_REPORT = [
  "## Traced nothing (0 callables)",
  "",
  "This gate read no code, so it judged none. It fails rather than passing:",
  "a gate that never looked cannot tell a clean project from an unread one.",
  "",
  "Check `exclude` and `excludeFrom` in the workspace callidescope",
  "configuration and in this project's own configuration for a pattern",
  "matching everything the project holds.",
].join("\n");

/** Gate's Nx selection matched no directory; nothing was traced. */
export const EMPTY_SCOPE_REPORT = [
  "## Traced nothing (no directories in scope)",
  "",
  "This gate's Nx selection resolved to no directory, so nothing was traced",
  "and nothing was judged. It fails rather than passing: a gate that never",
  "looked cannot tell a clean project from an unread one.",
  "",
  "Check the `projects` and `tags` this target was given, and whether the",
  "projects they name still hold a root of their own.",
].join("\n");
