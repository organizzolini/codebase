// ♟️ Constants

import type { SkillExclusionFile } from "./skill-exclusions.types";

/** Opening comment text of the generated block, in each file's syntax. */
export const BLOCK_START_LABEL = "installed-skills-start";

/** Body of the comment closing the generated block. */
export const BLOCK_END_LABEL = "installed-skills-end";

/** Files naming every installed skill; each needs markers. */
export const SKILL_EXCLUSION_FILES: SkillExclusionFile[] = [
  {
    commentPrefix: "#",
    filePath: ".gitattributes",
    renderEntry: (skillName) =>
      `.agents/skills/${skillName}/** linguist-vendored`,
    tool: "Linguist",
  },
  {
    commentPrefix: "#",
    filePath: "configuration/ic-suite/.codometerignore",
    renderEntry: (skillName) => `.agents/skills/${skillName}/`,
    tool: "codometer",
  },
  {
    // markdownlint reads its ignore globs from a JSONC array, so an entry is a
    // quoted string element carrying the array's indentation and a trailing
    // comma, and the markers are `//` comments rather than `#` ones.
    commentPrefix: "//",
    filePath: "configuration/lint/markdownlint-cli2.config.jsonc",
    renderEntry: (skillName) => `    ".agents/skills/${skillName}/**",`,
    tool: "markdownlint",
  },
  {
    // Prettier resolves ignore patterns relative to the ignore file, hence the
    // leading `**/`.
    commentPrefix: "#",
    filePath: "configuration/lint/.prettierignore",
    renderEntry: (skillName) => `**/.agents/skills/${skillName}/**`,
    tool: "prettier",
  },
  {
    // cspell reads its ignore globs from a YAML sequence, so an entry is a
    // list item at the sequence's indentation. The leading `**/` matches the
    // prettier pattern: cspell resolves globs relative to its configuration
    // file too.
    commentPrefix: "#",
    filePath: "configuration/lint/cspell.config.yaml",
    renderEntry: (skillName) => `  - "**/.agents/skills/${skillName}/**"`,
    tool: "cspell",
  },
];
