// ♟️ Constants

/** The directories a workspace project may live in, nested by domain. */
export const WORKSPACE_SCOPES = ["projects"];

/**
 * Root directories that never hold a project: the install, and `projects/`,
 * searched through `WORKSPACE_SCOPES` instead. Hidden ones are skipped.
 */
export const NON_PROJECT_ROOT_DIRECTORIES = ["node_modules", "projects"];

/**
 * Marks a conformetry template placeholder directory, such as
 * `{{nameKebabCase}}`, not a real project yet.
 */
export const TEMPLATE_PLACEHOLDER_PATTERN = /\{\{.*\}\}/;

/** The root README this check reads and enforces project coverage against. */
export const ROOT_README_PATH = "README.md";
