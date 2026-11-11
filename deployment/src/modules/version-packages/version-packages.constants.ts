// ♟️ Constants

/** Versions the release group, uncommitted; `NX_DAEMON=false` avoids stale graphs. */
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
  "\n# Added by the deployment version-packages command for the release only.\nconfiguration/\n";

/** The remote address that carries the release token, for every later push. */
export const authenticatedRemote = (
  token: string,
  repository: string,
): string => `https://x-access-token:${token}@github.com/${repository}.git`;
