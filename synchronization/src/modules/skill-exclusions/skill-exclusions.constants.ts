// ♟️ Constants

import type { SkillExclusionFile } from "./skill-exclusions.types";

/** Opening comment text of the generated block, in each file's syntax. */
export const BLOCK_START_LABEL = "installed-skills-start";

/** Body of the comment closing the generated block. */
export const BLOCK_END_LABEL = "installed-skills-end";

/** Files a skill's installer writes outside its folder, by skill name. */
export const VENDORED_SKILL_PATHS: Readonly<Record<string, readonly string[]>> =
  {
    impeccable: [
      ".claude/agents/impeccable-*",
      ".github/agents/impeccable-*",
      ".github/hooks/impeccable.json",
    ],
  };

/** Files naming every skill and its vendored files; each needs markers. */
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
