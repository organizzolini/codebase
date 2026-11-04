import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  cssKeywords,
  hclKeywords,
  jsonKeywords,
  pythonKeywords,
  shellKeywords,
  sqlKeywords,
  tomlKeywords,
  typescriptKeywords,
  yamlKeywords,
} from "@coinagerie/languages";

import type { CoinagerieConfiguration } from "@coinagerie/configuration";

// 📖 Glossary

/**
 * The root glossary every project's own glossary is written against.
 *
 * Resolved from this file rather than from the working directory, because a
 * project's check runs from the project's own folder.
 */
const ROOT_GLOSSARY_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../GLOSSARY.md",
);

/** One glossary bullet, `- **word**: definition`, captured down to the word. */
const GLOSSARY_BULLET_PATTERN = /^- \*\*(?<word>[^\s*]+)\*\*:/u;

/**
 * Reads the headwords the root glossary lists.
 *
 * Only the bullets matter: a definition, and any line continuing one, says
 * nothing about which words are covered. A missing file throws, so the run
 * names the configuration whose `exclude.words` failed instead of quietly
 * listing every word the root glossary was meant to cover.
 *
 * @returns Every word on a bullet of the root glossary, in file order
 */
export function readRootGlossaryWords(): string[] {
  return readFileSync(ROOT_GLOSSARY_PATH, "utf8")
    .split("\n")
    .flatMap(
      (line) => GLOSSARY_BULLET_PATTERN.exec(line)?.groups?.["word"] ?? [],
    );
}

// ♟️ Conventions

/**
 * Every language's reserved words, which name the language rather than
 * anything this repository did.
 *
 * The package exports them as plain lists and excludes nothing on its own, so
 * what a glossary leaves out is stated here, where a reader can see it.
 */
export const keywordExclusions: string[] = [
  ...cssKeywords,
  ...hclKeywords,
  ...jsonKeywords,
  ...pythonKeywords,
  ...shellKeywords,
  ...sqlKeywords,
  ...tomlKeywords,
  ...typescriptKeywords,
  ...yamlKeywords,
];

/**
 * Words the singularizer and the lemmatizer fold into something the code
 * never wrote, mapped back, and the abbreviations the code spells out in full
 * elsewhere, mapped onto that spelling.
 *
 * `fold` runs after plurals and inflections are folded, so every key is a
 * headword the package already produced: `caelundas` arrives as `caelunda`,
 * and `data` as `datum`.
 */
const FOLDED_WORDS = new Map([
  ["arg", "argument"],
  ["axio", "axios"],
  ["caelunda", "caelundas"],
  ["char", "character"],
  ["config", "configuration"],
  ["datum", "data"],
  ["dir", "directory"],
  ["env", "environment"],
  ["metadatum", "metadata"],
  ["nestj", "nestjs"],
  ["postgre", "postgres"],
  ["protobufj", "protobufjs"],
  ["rechart", "recharts"],
  ["vitej", "vitejs"],
  ["xarg", "xargs"],
]);

/**
 * Maps a headword onto the one this repository writes it as.
 *
 * @param word - A headword after plural and inflection folding
 * @returns The headword this repository keeps the word under
 */
export function foldRepositoryWord(word: string): string {
  return FOLDED_WORDS.get(word) ?? word;
}

// 🗣️ Common words

/**
 * Plain English and runtime vocabulary that no project defines differently
 * from anywhere else: function words, verbs every program uses, and the names
 * of the standard library, the test framework, and package manifest fields.
 *
 * Chosen by how many project glossaries listed the word unprompted, so a word
 * a project means something particular by belongs in that project's glossary
 * and stays out of this list. Written as one string per line of prose rather
 * than one array entry per word to stay under the file size limit.
 */
export const commonWordExclusions: string[] = `
  absolute actual address after afterward again allow alpha although
  analysis answer anything append array ask assertion assign at attach
  attempt basename because before better bind block bootstrap buffer bug
  builder byte call callback can capture cell character child chunk clear
  close collection color comment compare compile compiler complete compute
  configure connection console constant contain controller count css
  custom debug declaration decorator deep define definition describe
  difference directly disable discover display each edge empty enable
  encode entity entry equal every exactly example execute exp experimental
  expression extname extra factory failure fake field filename find finish
  finite first fixture flag flat force form gitkeep greater handler hide
  hoist homepage href identifier implementation implicit indent
  indentation injectable inline inside instance int invalid isolate it
  item java judge keep kind last lead least length less level link literal
  load loader locale locate location logger long lower make manifest math
  maximum md member meta method metric millisecond min miss mkdtemp mock
  next no non normalize now nullable ok omit once one open optional
  original other outside own pair parameter part partial pending per pick
  plain plan point pop position positive present preview previous promise
  protocol prototype provide publish quote reach readdir real reason
  recursive reduce reg regex reject relative remove rename repeat replace
  resolution rest round runner safe score search second section see
  segment sep separator sequence show signal skip slice so some sort spawn
  special split spy stack stat statement stdout stop strict stringify stub
  substitution success summary surface synthetic task temporary text than
  that the them timer tmpdir touch trim two unstub up valid variable vi
  visit walk warn what wide without work wrap
`
  .split(/\s+/u)
  .filter(Boolean);

// 🧩 Configuration

/**
 * What every project's `coinagerie.config.ts` spreads.
 *
 * Words the root glossary lists are excluded, so a project's own glossary
 * holds only the words that are its own. The root configuration does not
 * spread this: it writes the glossary these words are read from, and reading
 * it would exclude every word it was about to write.
 *
 * A named export beside the default: the loader reads only a file's default
 * export, and a project spreading the shared configuration imports it by name.
 */
export const coinagerieConfiguration = {
  exclude: {
    words: (): string[] => [
      ...keywordExclusions,
      ...commonWordExclusions,
      ...readRootGlossaryWords(),
    ],
  },
  fold: foldRepositoryWord,
} satisfies CoinagerieConfiguration;

/**
 * The `configuration` project's own glossary, written into its README.
 *
 * The default export is what the loader reads, so it adds the one output the
 * spread configuration above leaves to each project.
 */
export default {
  ...coinagerieConfiguration,
  outputs: [
    {
      description:
        "The words this project uses that the root glossary does not define, regenerated with `nx run configuration:coinagerie-check:write`.",
      path: "README.md",
      type: "markdown",
    },
  ],
} satisfies CoinagerieConfiguration;
