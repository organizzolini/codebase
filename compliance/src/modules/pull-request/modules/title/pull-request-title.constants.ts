// ♟️ Constants

export const COMMITLINT_ARGUMENTS = [
  "commitlint",
  "--config",
  "configuration/repository/commitlint.config.ts",
] as const;

/** The most scopes a pull request title may name, so the header stays under 128 characters. */
export const MAXIMUM_TITLE_SCOPES = 3;

/** Pulls the comma-separated scopes out of `type(scopes)!: subject`. */
export const TITLE_SCOPES_PATTERN = /^[a-z]+\(([^)]*)\)!?:/u;

/** Reports a title that names more scopes than the limit allows. */
export const tooManyScopesMessage = (scopes: readonly string[]): string =>
  `❌ Pull request title names ${String(scopes.length)} scopes (${scopes.join(", ")}), but at most ${String(MAXIMUM_TITLE_SCOPES)} are allowed — keep the ${String(MAXIMUM_TITLE_SCOPES)} that carry the most of the work`;
