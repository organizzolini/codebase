// ♟️ Constants

/** Every manifest that can make a folder a project. */
export const PROJECT_MANIFEST_GLOB = "**/{project.json,package.json}";

/** The file that makes a folder an Nx project on its own. */
export const PROJECT_JSON_FILENAME = "project.json";

/** Manifest that marks a project; fixtures must not invent one. */
export const PACKAGE_JSON_FILENAME = "package.json";

/** The inputs a source-only limit run judges: every file of the project. */
export const LIMIT_INPUT = "default";

/** Where a limit run leaves its report, relative to the project root. */
export const LIMIT_REPORT_PATH = "codometer-limit-report.json";

/** The one input a limit run measures, so it needs no build. */
export const LIMIT_ONLY_INPUTS = ["codebase"] as const;

/** Where a weigh run leaves the report the pull request's section reads. */
export const WEIGH_REPORT_PATH = "codometer-weigh-report.json";

/** Where a weigh run writes the badge block, when asked to. */
export const WEIGH_MARKDOWN_PATH = "documentation/codometer.md";

/** The target a weigh run waits for, because it reads compiled output. */
export const BUILD_TARGET_NAME = "build";

/** Global cache key; a module cache splits on plugin reloads. */
export const PLUGIN_CONTEXT_GLOBAL_KEY = "__codometerPluginContext";
