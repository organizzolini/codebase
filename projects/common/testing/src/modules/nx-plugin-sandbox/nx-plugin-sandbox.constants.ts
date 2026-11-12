import path from "node:path";

/** The dist-tag published packages carry unless a test names another. */
export const DEFAULT_REGISTRY_TAG = "e2e";

/** Prefix of the throwaway account a sandbox registry signs up, made unique per registry. */
export const REGISTRY_USER_PREFIX = "e2e";

/** That account's password. */
export const REGISTRY_PASSWORD = "e2e-password";

/** How long publishing one tarball, or installing a workspace, may take. */
export const REGISTRY_OPERATION_TIMEOUT_MS = 300_000;

/** The workspace's Verdaccio config, shared with the `local-registry` target. */
export const VERDACCIO_CONFIG_PATH = path.resolve(
  import.meta.dirname,
  "../../../../../../configuration/verdaccio.config.yml",
);

/** A larger body limit than Verdaccio's default, for packed tarballs. */
export const VERDACCIO_MAXIMUM_BODY_SIZE = "200mb";
