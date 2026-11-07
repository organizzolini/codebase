// ♟️ Constants

/**
 * Where the knip binary sits, relative to the workspace root.
 *
 * Run from the workspace's own `node_modules` rather than imported, so this
 * project needs no dependency on knip and always runs the version the rest of
 * the workspace does.
 */
export const KNIP_BINARY = "node_modules/.bin/knip";
