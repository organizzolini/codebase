// ♟️ Constants

/** Every manifest that can make a folder a project. */
export const PROJECT_MANIFEST_GLOB = "**/{project.json,package.json}";

/** The file that makes a folder an Nx project on its own. */
export const PROJECT_JSON_FILENAME = "project.json";

/** Manifest that marks a project; fixtures must not invent one. */
export const PACKAGE_JSON_FILENAME = "package.json";

/** Whole-project input, since Nx cannot see which files matter. */
export const PROJECT_FILES_INPUT = "{projectRoot}/**/*";

/** Global cache key; a module cache splits on plugin reloads. */
export const PLUGIN_CONTEXT_GLOBAL_KEY = "__coinageriePluginContext";
