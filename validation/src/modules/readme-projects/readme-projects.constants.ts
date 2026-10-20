// ♟️ Constants

/** The directories a workspace project may live in, nested by domain. */
export const WORKSPACE_SCOPES = ["projects"];

/**
 * Workspace root directories that never hold a project of their own: the
 * dependency install, and `projects/`, which is searched through
 * `WORKSPACE_SCOPES` instead. Hidden directories are skipped by name.
 */
export const NON_PROJECT_ROOT_DIRECTORIES = ["node_modules", "projects"];

/**
 * What marks a directory as a conformetry template's placeholder, such as
 * `{{nameKebabCase}}`, rather than a project: the manifest inside it belongs
 * to a project that does not exist yet.
 */
export const TEMPLATE_PLACEHOLDER_PATTERN = /\{\{.*\}\}/;

/** The root README this check reads and enforces project coverage against. */
export const ROOT_README_PATH = "README.md";
