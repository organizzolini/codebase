// ♟️ Constants

/** Docker Hub, then Google's mirror on rate limits; Postgres 18. */
export const POSTGRES_CONTAINER_IMAGES = [
  "postgres:18-alpine",
  "mirror.gcr.io/library/postgres:18-alpine",
] as const;

/** Where the official image runs scripts from on its first start. */
export const POSTGRES_CONTAINER_INITIALIZATION_PATH =
  "/docker-entrypoint-initdb.d/project.sql";
