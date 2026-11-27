// ♟️ Constants

/** What a release version looks like. */
export const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[\w.\-]+)?$/v;

/** Every Helm values file, which semantic-release also commits. */
export const VALUES_GLOB = "infrastructure/helm/*/values/*.yaml";

/** Where this repository's images live. */
export const IMAGE_REPOSITORY_PREFIX = "ghcr.io/organizzolini/";

/** Reports a version that cannot be a release's. */
export const invalidVersionMessage = (version: string): string =>
  `❌ "${version}" is not a release version`;

/** Reports a workspace whose values files name no image. */
export const NO_IMAGES_MESSAGE = `❌ No Helm values file sets image.repository under ${IMAGE_REPOSITORY_PREFIX}`;
