// ♟️ Constants

/** Versions the release group and writes its changelogs, committing nothing. */
export const NX_RELEASE = ["exec", "nx", "release", "--skip-publish"];

/** The remote address that carries the release token, for every later push. */
export const authenticatedRemote = (
  token: string,
  repository: string,
): string => `https://x-access-token:${token}@github.com/${repository}.git`;
