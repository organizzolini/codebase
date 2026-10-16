// ♟️ Constants

/**
 * Versions the release group and writes its changelogs, committing nothing,
 * through `env` so the Nx daemon stays off for this one run: a daemon would
 * keep the graph it built before the release's `.nxignore` addition.
 */
export const NX_RELEASE = [
  "NX_DAEMON=false",
  "pnpm",
  "exec",
  "nx",
  "release",
  "--skip-publish",
];

/** The workspace file Nx drops matching paths with, from changes and graph. */
export const NXIGNORE_FILE = ".nxignore";

/** What the release appends to `.nxignore`, for the release only. */
export const RELEASE_NXIGNORE_ADDITION =
  "\n# Added by the publication version-packages command for the release only.\nprojects/configuration/\n";

/** The remote address that carries the release token, for every later push. */
export const authenticatedRemote = (
  token: string,
  repository: string,
): string => `https://x-access-token:${token}@github.com/${repository}.git`;
