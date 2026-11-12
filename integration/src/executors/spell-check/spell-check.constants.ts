// ♟️ Constants

/** cspell's path in the workspace `node_modules`, so no cspell dependency. */
export const CSPELL_BINARY = "node_modules/.bin/cspell";

/** Files spelling is checked in, as a brace glob suffix. */
export const SPELL_CHECKED_FILES =
  "**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs,json,jsonc,json5,css,scss,html,yaml,yml,md,mdx,py,ipynb,sql}";

/** One cspell finding: `path:line:column - Unknown word (word)`. */
export const FINDING = /^(?<file>\S.*?):\d+:\d+ - /gmu;
