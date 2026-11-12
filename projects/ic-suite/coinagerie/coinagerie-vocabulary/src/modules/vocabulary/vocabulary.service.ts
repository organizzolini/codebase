import { readFile } from "node:fs/promises";
import path from "node:path";

import { LanguagesService } from "@coinagerie/languages";
import { Injectable } from "@nestjs/common";

import { DiscoveryService } from "../discovery/discovery.service";
import { FoldingService } from "../folding/folding.service";
import { WordsService } from "../words/words.service";

import type { ResolvedCoinagerieConfiguration } from "@coinagerie/configuration";

/**
 * The coinagerie pipeline: from a configuration to the sorted words the code
 * uses. Splits paths and identifiers into words, folds each into its headword,
 * drops excluded headwords, then de-duplicates. A fault in `fold` aborts the
 * run, naming the configuration file.
 */
@Injectable()
export class VocabularyService {
  // 🏗 Dependency Injection

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly foldingService: FoldingService,
    private readonly languagesService: LanguagesService,
    private readonly wordsService: WordsService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** The words of one file: its path's, then its identifiers'. */
  private async collectFile(
    directory: string,
    relativePath: string,
  ): Promise<string[]> {
    const pathWords = this.wordsService.splitPath(relativePath);
    const tokenizer = this.languagesService.tokenizerFor(relativePath);

    if (tokenizer === undefined) {
      return pathWords;
    }

    const content = await readFile(path.join(directory, relativePath), "utf8");

    return [
      ...pathWords,
      ...tokenizer(content, relativePath).flatMap((identifier) =>
        this.wordsService.splitIdentifier(identifier),
      ),
    ];
  }

  /**
   * The headwords the configuration excludes by exact word. Words fold the way code words do, so excluding `service` covers `services`.
   */
  private excludedHeadwords(
    configuration: ResolvedCoinagerieConfiguration,
  ): Set<string> {
    const excluded = new Set<string>();

    for (const word of configuration.exclude.words) {
      const lowercase = word.toLowerCase();

      // Folding is not idempotent (`bounding` folds to `bound`, which folds
      // to `bind`), so a word already written as a headword stays excluded.
      excluded.add(lowercase);
      excluded.add(this.foldingService.headword(lowercase, configuration));
    }

    return excluded;
  }

  /** Whether a pattern leaves out a word: it matches the word or its headword. */
  private matchesPattern(
    word: string,
    headword: string,
    patterns: RegExp[],
  ): boolean {
    return patterns.some(
      (pattern) => pattern.test(word) || pattern.test(headword),
    );
  }

  // 🌎 Public Methods

  /**
   * Every word the configured files use, sorted and de-duplicated. Output files are skipped, so a run never reads its own glossary back.
   */
  async collect(
    configuration: ResolvedCoinagerieConfiguration,
  ): Promise<string[]> {
    const files = this.discoveryService.discover({
      directory: configuration.directory,
      exclude: configuration.exclude.paths,
      include: configuration.include,
      skip: configuration.outputs.map((output) => output.path),
    });
    const excluded = this.excludedHeadwords(configuration);
    const patterns = configuration.exclude.patterns;
    const words = new Set<string>();
    const headwords = new Map<string, string>();
    const patternExcluded = new Set<string>();

    // One file at a time: reading every file at once opens them all at once,
    // which exhausts the file descriptors of a large repository.
    for (const relativePath of files) {
      for (const word of await this.collectFile(
        configuration.directory,
        relativePath,
      )) {
        const headword =
          headwords.get(word) ??
          this.foldingService.headword(word, configuration);

        headwords.set(word, headword);

        if (this.matchesPattern(word, headword, patterns)) {
          patternExcluded.add(headword);
        }

        if (!excluded.has(headword)) {
          words.add(headword);
        }
      }
    }

    return [...words]
      .filter((headword) => !patternExcluded.has(headword))
      .toSorted();
  }
}
