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

// 🧩 Configuration

/**
 * What every project's `coinagerie.config.ts` spreads.
 *
 * Words the root glossary lists are excluded, so a project's own glossary
 * holds only the words that are its own. The root configuration does not
 * spread this: it writes the glossary these words are read from, and reading
 * it would exclude every word it was about to write.
 *
 * A named export beside a default of the same object: the loader reads only a
 * file's default export, and a project spreading the shared configuration
 * imports it by name.
 */
export const coinagerieConfiguration = {
  exclude: {
    words: (): string[] => [...keywordExclusions, ...readRootGlossaryWords()],
  },
  fold: foldRepositoryWord,
} satisfies CoinagerieConfiguration;

export default coinagerieConfiguration;
