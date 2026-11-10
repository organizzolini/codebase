// ♟️ Constants

/**
 * Images tried in order: Docker Hub, then Google's mirror in case of a rate
 * limit. Postgres 18 is the first with native `uuidv7()`.
 */
export const POSTGRES_CONTAINER_IMAGES = [
  "postgres:18-alpine",
  "mirror.gcr.io/library/postgres:18-alpine",
] as const;

/** Where the official image runs scripts from on its first start. */
export const POSTGRES_CONTAINER_INITIALIZATION_PATH =
  "/docker-entrypoint-initdb.d/project.sql";
