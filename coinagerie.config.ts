import {
  foldRepositoryWord,
  keywordExclusions,
} from "./configuration/coinagerie.config.js";

import type { CoinagerieConfiguration } from "@coinagerie/configuration";

/**
 * The root glossary: the words of every folder that is not a project.
 *
 * A project writes its own words into its own README. What is left for the
 * root are the folders no project owns and the files beside them, so the
 * words they use are defined once, here, and every project excludes them.
 *
 * Each project folder is listed by name rather than found, because a new one
 * should be a decision someone makes here. `docs` and `openwiki` are links
 * into `documentation`, which is listed already.
 */
export default {
  exclude: {
    paths: [
      // Installed skills: other people's prose, scripts, and data.
      ".agents/**",
      // Lists every package ever resolved, hashes included.
      "pnpm-lock.yaml",
      "skills-lock.json",
      // Editor settings name the editor's vocabulary, not this repository's.
      ".vscode/**",
      // Folders that are projects.
      "configuration/**",
      "documentation/**",
      "infrastructure/**",
      "installation/**",
      "integration/**",
      "projects/**",
      "publication/**",
      "synchronization/**",
      "validation/**",
      // Links into the project folders above.
      "docs/**",
      "openwiki/**",
    ],
    words: keywordExclusions,
  },
  fold: foldRepositoryWord,
  outputs: [
    {
      description:
        "The words the repository uses outside its projects, regenerated with `nx run configuration:coinagerie:write`.",
      path: "GLOSSARY.md",
      type: "markdown",
    },
  ],
} satisfies CoinagerieConfiguration;
