// ♟️ Constants

/** Attempts to reach the Docker daemon, a second apart. */
export const DOCKER_DAEMON_READINESS_ATTEMPTS = 30;

/** Where the started Docker daemon writes its output, under home. */
export const DOCKER_DAEMON_LOG_PATH = ".local/state/dockerd.log";

/** The Nx target that starts the local Postgres container. */
export const POSTGRES_UP_TARGET = "infrastructure:postgres:up";
