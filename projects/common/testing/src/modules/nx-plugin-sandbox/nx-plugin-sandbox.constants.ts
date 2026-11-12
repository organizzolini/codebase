/** The dist-tag published packages carry unless a test names another. */
export const DEFAULT_REGISTRY_TAG = "e2e";

/** Prefix of the throwaway account a sandbox registry signs up, made unique per registry. */
export const REGISTRY_USER_PREFIX = "e2e";

/** That account's password. */
export const REGISTRY_PASSWORD = "e2e-password";

/** How long publishing one tarball, or installing a workspace, may take. */
export const REGISTRY_OPERATION_TIMEOUT_MS = 300_000;

/**
 * The `configuration/verdaccio.config.yml` the `local-registry` target uses,
 * with storage moved to a temporary directory and a larger body limit for
 * packed tarballs.
 */
export const VERDACCIO_CONFIG = {
  log: { format: "pretty", level: "warn", type: "stdout" },
  max_body_size: "200mb",
  packages: {
    "**": {
      access: "$all",
      proxy: "npmjs",
      publish: "$all",
      unpublish: "$all",
    },
  },
  publish: { allow_offline: true },
  uplinks: { npmjs: { maxage: "60m", url: "https://registry.npmjs.org" } },
} as const;
