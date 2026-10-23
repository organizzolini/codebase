// ♟️ Constants

import type { SkillExclusionFile } from "./skill-exclusions.types";

/**
 * Body of the comment opening the generated block.
 *
 * A label rather than a whole marker, because each file prefixes it with its
 * own comment syntax: `#` for the four line-oriented ignore files and YAML,
 * `//` for JSONC.
 */
export const BLOCK_START_LABEL = "installed-skills-start";

/** Body of the comment closing the generated block. */
export const BLOCK_END_LABEL = "installed-skills-end";

/**
 * The files a vendored skill's installer writes outside
 * `.agents/skills/<name>/`, by skill name.
 *
 * Some installers copy their agents and hooks into each harness folder they
 * find (`.claude`, `.github`, `.codex`), where the same tools reach them: the
 * spell check flags their prose, and ESLint's markdown rules flag the HTML in
 * it. Nothing in `skills-lock.json` names these files, so they are declared
 * here, and written into every list only while the skill that owns them is
 * installed. A new installer's files fail the weekly upgrade's pre-commit hook
 * until they are added.
 */
export const VENDORED_SKILL_PATHS: Readonly<Record<string, readonly string[]>> =
  {
    impeccable: [
      ".claude/agents/impeccable-*",
      ".codex/hooks.json",
      ".github/agents/impeccable-*",
      ".github/hooks/impeccable.json",
    ],
  };

/**
 * The files that must name every installed skill and its vendored files.
 *
 * Every other tool in the repository scopes itself with explicit globs that
 * never include `.agents/`, so these six are the whole list. Adding a seventh
 * means adding its markers to the file in the same change.
 */
export const SKILL_EXCLUSION_FILES: SkillExclusionFile[] = [
  {
    commentPrefix: "#",
    filePath: ".gitattributes",
    renderEntry: (skillName) =>
      `.agents/skills/${skillName}/** linguist-vendored`,
    renderPath: (glob) => `${glob} linguist-vendored`,
    tool: "Linguist",
  },
  {
    commentPrefix: "#",
    filePath: "configuration/.codometerignore",
    renderEntry: (skillName) => `.agents/skills/${skillName}/`,
    renderPath: (glob) => glob,
    tool: "codometer",
  },
  {
    // markdownlint reads its ignore globs from a JSONC array, so an entry is a
    // quoted string element carrying the array's indentation and a trailing
    // comma, and the markers are `//` comments rather than `#` ones.
    commentPrefix: "//",
    filePath: "configuration/markdownlint-cli2.config.jsonc",
    renderEntry: (skillName) => `    ".agents/skills/${skillName}/**",`,
    renderPath: (glob) => `    "${glob}",`,
    tool: "markdownlint",
  },
  {
    // Prettier resolves ignore patterns relative to the ignore file, hence the
    // leading `**/`.
    commentPrefix: "#",
    filePath: "configuration/.prettierignore",
    renderEntry: (skillName) => `**/.agents/skills/${skillName}/**`,
    renderPath: (glob) => `**/${glob}`,
    tool: "prettier",
  },
  {
    // cspell reads its ignore globs from a YAML sequence, so an entry is a
    // list item at the sequence's indentation. The leading `**/` matches the
    // prettier pattern: cspell resolves globs relative to its configuration
    // file too.
    commentPrefix: "#",
    filePath: "configuration/cspell.config.yaml",
    renderEntry: (skillName) => `  - "**/.agents/skills/${skillName}/**"`,
    renderPath: (glob) => `  - "**/${glob}"`,
    tool: "cspell",
  },
  {
    // ESLint's markdown rules already skip `.agents/**`, so only the files a
    // skill installs elsewhere are listed, as string elements of that rule
    // block's `ignores` array.
    commentPrefix: "//",
    filePath: "configuration/eslint.config.ts",
    renderPath: (glob) => `      "${glob}",`,
    tool: "ESLint",
  },
];
