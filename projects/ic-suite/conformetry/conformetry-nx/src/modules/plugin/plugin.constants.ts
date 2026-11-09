// ♟️ Constants

/**
 * Glob matching the configuration and every `project.json`. A `project.json`
 * glob alone leaves the daemon stale after a configuration edit.
 */
export const PROJECT_CONFIGURATION_GLOB =
  "**/{project.json,conformetry.config.*}";

/** Basename that marks a matched file as an actual project description. */
export const PROJECT_CONFIGURATION_FILENAME = "project.json";

/**
 * Global key for the cached application context. A module-level cache would
 * split in two when Nx's plugin isolation reloads the module.
 */
export const PLUGIN_CONTEXT_GLOBAL_KEY = "__conformetryPluginContext";

/**
 * Root of the workspace-level project, skipped during inference. Inferring a
 * target there would duplicate every project's work under one uncacheable task.
 */
export const WORKSPACE_PROJECT_ROOT = ".";

/**
 * Source of the program that hashes template folders: each folder recursively,
 * in name order, folded into one digest. A missing folder contributes nothing.
 */
export const TEMPLATE_HASH_SOURCE = String.raw`
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const list = (directory) =>
  fs
    .readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .flatMap((entry) =>
      entry.isDirectory()
        ? list(path.join(directory, entry.name))
        : [path.join(directory, entry.name)],
    );
const hash = crypto.createHash("sha256");
for (const directory of DIRECTORIES) {
  if (!fs.existsSync(directory)) continue;
  for (const file of list(directory)) {
    hash.update(file + "\0");
    hash.update(fs.readFileSync(file));
  }
}
process.stdout.write(hash.digest("base64"));
`;
