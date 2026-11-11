// ♟️ Constants

import { CONFIGURATION_FILE_NAMES } from "@coinagerie/configuration";

/** Loader file names as a glob; matches rerun the plugin. */
export const CONFIGURATION_GLOB = `**/{${CONFIGURATION_FILE_NAMES.join(",")}}`;

/** The file that makes a folder an Nx project on its own. */
export const PROJECT_JSON_FILENAME = "project.json";

/** Manifest that marks a project; fixtures must not invent one. */
export const PACKAGE_JSON_FILENAME = "package.json";

/** Whole-project input, since Nx cannot see which files matter. */
export const PROJECT_FILES_INPUT = "{projectRoot}/**/*";

/** Global cache key; a module cache splits on plugin reloads. */
export const PLUGIN_CONTEXT_GLOBAL_KEY = "__coinageriePluginContext";
