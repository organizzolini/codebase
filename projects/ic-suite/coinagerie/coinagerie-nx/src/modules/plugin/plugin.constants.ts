// ♟️ Constants

import { CONFIGURATION_FILE_NAMES } from "@coinagerie/configuration";

/**
 * Glob of every file name the coinagerie loader reads, drawn from its own list.
 * Nx re-runs the plugin when a match changes.
 */
export const CONFIGURATION_GLOB = `**/{${CONFIGURATION_FILE_NAMES.join(",")}}`;

/** The file that makes a folder an Nx project on its own. */
export const PROJECT_JSON_FILENAME = "project.json";

/**
 * The manifest that makes a folder a project. A configuration in a fixture or
 * template, with no project to run, must not invent one.
 */
export const PACKAGE_JSON_FILENAME = "package.json";

/**
 * Input covering the whole project, since Nx cannot know which files a
 * configuration includes. A project may narrow it with its own target `inputs`.
 */
export const PROJECT_FILES_INPUT = "{projectRoot}/**/*";

/**
 * Global key for the cached application context. A module-level cache would
 * split in two when Nx's plugin isolation reloads the module.
 */
export const PLUGIN_CONTEXT_GLOBAL_KEY = "__coinageriePluginContext";
