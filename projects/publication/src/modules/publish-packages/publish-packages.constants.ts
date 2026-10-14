// ♟️ Constants

/** Where the GitHub Packages mirrors go, unless overridden to rehearse. */
export const DEFAULT_GITHUB_PACKAGES_REGISTRY = "https://npm.pkg.github.com";

/** The file pnpm's `--report-summary` writes in the directory it runs from. */
export const PUBLISH_SUMMARY_FILE = "pnpm-publish-summary.json";

/** Lists each `<name>@<version>` this run put on npm, for `link-packages`. */
export const NEWLY_PUBLISHED_FILE = "newly-published.txt";

/** Where each mirror is packed and renamed, beneath `RUNNER_TEMP`. */
export const MIRRORS_DIRECTORY = "github-packages";

export const PUBLISHING_MESSAGE = "📦 Publishing the release group to npm";

/** The user-config line that authenticates to a registry. */
export const authenticationLine = (registry: string, token: string): string =>
  `//${registry.replace(/^[^:]*:\/\//, "")}/:_authToken=${token}\n`;

/** Reports a mirror GitHub Packages already has. */
export const alreadyMirroredMessage = (specifier: string): string =>
  `🐙 ${specifier} is already on GitHub Packages`;

/** Reports a package about to be mirrored. */
export const mirroringMessage = (specifier: string, mirror: string): string =>
  `🐙 Mirroring ${specifier} to GitHub Packages as ${mirror}`;
