// ♟️ Constants

/** The directories a workspace project may live in, nested by domain. */
export const WORKSPACE_SCOPES = ["projects"];

/** Root directories holding no project; hidden ones are skipped. */
export const NON_PROJECT_ROOT_DIRECTORIES = ["node_modules", "projects"];

/** Marks an unfilled conformetry template directory, such as `{{nameKebabCase}}`. */
export const TEMPLATE_PLACEHOLDER_PATTERN = /\{\{.*\}\}/;

/** The root README this check reads and enforces project coverage against. */
export const ROOT_README_PATH = "README.md";
