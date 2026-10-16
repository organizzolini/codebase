// ♟️ Constants

/** Where the GitHub Packages mirrors go, unless overridden to rehearse. */
export const DEFAULT_GITHUB_PACKAGES_REGISTRY = "https://npm.pkg.github.com";

/** The file pnpm's `--report-summary` writes in the directory it runs from. */
export const PUBLISH_SUMMARY_FILE = "pnpm-publish-summary.json";

/** Where each mirror is packed and renamed, beneath `RUNNER_TEMP`. */
export const MIRRORS_DIRECTORY = "github-packages";

export const PUBLISHING_MESSAGE = "📦 Publishing the release group to npm";

/** The user-config line that authenticates to a registry. */
export const authenticationLine = (registry: string, token: string): string =>
  `//${registry.replace(/^[^:]*:\/\//, "")}/:_authToken=${token}\n`;

/** Refuses a rehearsal that would still reach GitHub Packages. */
export const MIRROR_UNSEALED_MESSAGE =
  "❌ Rehearsing against NPM_REGISTRY needs GITHUB_PACKAGES_REGISTRY pointed off GitHub too";

/** Refuses a rehearsal whose package would still publish elsewhere. */
export const unsealedMessage = (name: string, registry: string): string =>
  `❌ ${name} publishes to ${registry} whatever NPM_REGISTRY says; strip its publishConfig.registry to rehearse`;

/** Reports a mirror GitHub Packages already has. */
export const alreadyMirroredMessage = (specifier: string): string =>
  `🐙 ${specifier} is already on GitHub Packages`;

/** Reports a package about to be mirrored. */
export const mirroringMessage = (specifier: string, mirror: string): string =>
  `🐙 Mirroring ${specifier} to GitHub Packages as ${mirror}`;
