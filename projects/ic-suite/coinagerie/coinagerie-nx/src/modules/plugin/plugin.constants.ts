// ♟️ Constants

import { CONFIGURATION_FILE_NAMES } from "@coinagerie/configuration";

/**
 * Glob `createNodes` matches: every file name the coinagerie loader reads.
 *
 * Drawn from the loader's own list rather than restated, so a file the
 * command line would load is a file this plugin infers a target for. Nx
 * re-runs a plugin when a file matching its glob changes, which is also what
 * lets an added or removed configuration add or remove its project's target.
 */
export const CONFIGURATION_GLOB = `**/{${CONFIGURATION_FILE_NAMES.join(",")}}`;

/**
 * Files whose presence marks a folder as an Nx project.
 *
 * A configuration file in a folder that is no project — a fixture, a template
 * — describes nothing Nx can run a target on, and returning a project for it
 * would invent one.
 */
export const PROJECT_MANIFEST_FILENAMES = ["project.json", "package.json"];

/**
 * Cache input covering everything the project holds.
 *
 * The check reads the files its configuration includes, which Nx cannot know
 * without evaluating that configuration, so the whole project is the safe
 * answer: it can only over-invalidate, never serve a stale pass. Nx hashes
 * tracked files only, so build output and dependencies never join it. A
 * project whose configuration scans less can narrow this by declaring its own
 * `inputs` on the target.
 */
export const PROJECT_FILES_INPUT = "{projectRoot}/**/*";

/**
 * Key the plugin's application context is cached under on `globalThis`.
 *
 * Global rather than module-level so that loading this module twice — which
 * Nx's plugin isolation can do — still yields one NestJS context per process.
 */
export const PLUGIN_CONTEXT_GLOBAL_KEY = "__coinageriePluginContext";
