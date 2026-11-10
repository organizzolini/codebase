// ♟️ Constants

/** The file each project ships, holding safe placeholder values. */
export const DEFAULT_FILE_NAME = ".env.default";

/** The file a developer edits, which is never overwritten once it exists. */
export const ENVIRONMENT_FILE_NAME = ".env";

/** Git-known `.env.default` files, minus conformetry templates, so a template never becomes a real `.env`. */
export const DEFAULT_FILE_PATTERNS = [
  ".env.default",
  "*/.env.default",
  ":!:configuration/conformetry-templates/**",
];

/** The variable docker-compose volume mounts resolve against on the host. */
export const WORKSPACE_VARIABLE_NAME = "LOCAL_WORKSPACE_FOLDER";

/** Matches a root `.env` that already sets the workspace variable. */
export const WORKSPACE_VARIABLE_PATTERN = /^LOCAL_WORKSPACE_FOLDER=/mu;

/** The comment written above the workspace variable. */
export const WORKSPACE_VARIABLE_COMMENT =
  "# Local workspace path (used by docker-compose for volume mounts)";
