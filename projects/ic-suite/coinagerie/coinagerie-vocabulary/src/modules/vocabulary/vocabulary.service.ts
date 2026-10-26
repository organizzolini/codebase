import { readFile } from "node:fs/promises";
import path from "node:path";

import { LanguagesService } from "@coinagerie/languages";
import { Injectable } from "@nestjs/common";

import { DiscoveryService } from "../discovery/discovery.service";
import { WordsService } from "../words/words.service";

import type { ResolvedCoinagerieConfiguration } from "@coinagerie/configuration";

/**
 * The coinagerie pipeline: from a configuration to the sorted list of every
 * word the code uses.
 *
 * Discovers the files, splits every path into words, tokenizes every file a
 * language claims and splits its identifiers into words, then de-duplicates
 * and sorts. A file no language claims still contributes its path.
 */
@Injectable()
export class VocabularyService {
  // 🏗 Dependency Injection

  constructor(
    private readonly discoveryService: DiscoveryService,
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

  // 🌎 Public Methods

  /**
   * Every word the configured files use, sorted and de-duplicated.
   *
   * The files a configuration writes a glossary to are left out, so a run
   * never reads its own output back as vocabulary.
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
    const fileWords = await Promise.all(
      files.map(async (relativePath) =>
        this.collectFile(configuration.directory, relativePath),
      ),
    );

    return [...new Set(fileWords.flat())].toSorted();
  }
}
