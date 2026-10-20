// ♟️ Constants

/** How many times to ask whether the Docker daemon is up, a second apart. */
export const DOCKER_DAEMON_READINESS_ATTEMPTS = 30;

/** Where the Docker daemon the setup starts writes its output, under the home directory. */
export const DOCKER_DAEMON_LOG_PATH = ".local/state/dockerd.log";

/** The Nx target that starts the local Postgres container. */
export const POSTGRES_UP_TARGET = "infrastructure:postgres:up";
