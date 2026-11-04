// ♟️ Constants

/**
 * Where the cspell binary sits, relative to the workspace root.
 *
 * Run from the workspace's own `node_modules` rather than imported, so this
 * project needs no dependency on cspell and always runs the version the rest of
 * the workspace does.
 */
export const CSPELL_BINARY = "node_modules/.bin/cspell";

/** The files a project's spelling is checked in, as a brace glob suffix. */
export const SPELL_CHECKED_FILES =
  "**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs,json,jsonc,json5,css,scss,html,yaml,yml,md,mdx,py,ipynb,sql}";

/** One cspell finding: `path:line:column - Unknown word (word)`. */
export const FINDING = /^(?<file>\S.*?):\d+:\d+ - /gmu;
