// ♟️ Constants

/** Glob for configuration and `project.json` files; the daemon needs both. */
export const PROJECT_CONFIGURATION_GLOB =
  "**/{project.json,conformetry.config.*}";

/** Basename that marks a matched file as an actual project description. */
export const PROJECT_CONFIGURATION_FILENAME = "project.json";

/** `globalThis` key for the cached context, surviving plugin isolation reloads. */
export const PLUGIN_CONTEXT_GLOBAL_KEY = "__conformetryPluginContext";

/** Workspace root project, skipped to avoid duplicating all work. */
export const WORKSPACE_PROJECT_ROOT = ".";

/** Hashes template folders recursively, in name order, into one digest. */
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
