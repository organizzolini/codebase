import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Text, Token, Word } from "@codebase/lexico-db";
import { LoggerService } from "@codebase/observability";

import {
  ENCLITIC_MINIMUM_BASE_LENGTH,
  ENCLITIC_SUFFIXES,
  RELINK_CHUNK_SIZE,
} from "./literature.constants";
import { LiteratureWordNormalizationService } from "./modules/text-ingestion/literature-word-normalization.service";

import type { RelinkSummary, WordIndex } from "./literature.types";
import type { Repository } from "typeorm";

/**
 * Links a literature word to the dictionary word it is a spelling of, trying
 * the exact spelling, then u/v, i/j and ligature variants, then a word less
 * its -que, -ve or -ne, and only then e for ae and oe.
 */
@Injectable()
export class LiteratureWordLinkingService {
  // 🏗 Dependency Injection

  public constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(Word)
    private readonly wordRepository: Repository<Word>,
    private readonly normalization: LiteratureWordNormalizationService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(LiteratureWordLinkingService.name);
  }

  // 🔐 Private Fields

  private readonly indexes = new WeakMap<
    ReadonlyMap<string, string>,
    WordIndex
  >();

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Groups every word's id under each looser spelling of it. */
  private buildIndex(words: ReadonlyMap<string, string>): WordIndex {
    const diphthongs = new Map<string, [string, string][]>();
    const folded = new Map<string, [string, string][]>();
    for (const [data, id] of words) {
      const key = this.normalization.fold(data);
      folded.set(key, [...(folded.get(key) ?? []), [data, id]]);
      const loose = this.normalization.foldDiphthongs(key);
      diphthongs.set(loose, [...(diphthongs.get(loose) ?? []), [data, id]]);
    }
    return { diphthongs, folded };
  }

  /** Brings each text's count of recognised words up to the links its tokens now hold. */
  private async countRecognisedWords(tokenTable: string): Promise<void> {
    const textTable =
      this.tokenRepository.manager.dataSource.getMetadata(Text).tablePath;
    await this.tokenRepository.manager.query(
      `UPDATE ${textTable} AS text SET recognised_word_count = counts.recognised FROM (SELECT text_id, count(*) AS recognised FROM ${tokenTable} WHERE word_id IS NOT NULL AND is_punctuation = false GROUP BY text_id) AS counts WHERE counts.text_id = text.id`,
    );
  }

  /** How far a spelling is from the target: length difference first, then differing letters. */
  private distance(spelling: string, target: string): number {
    let differing = Math.abs(spelling.length - target.length) * target.length;
    for (let at = 0; at < Math.min(spelling.length, target.length); at++) {
      if (spelling[at] !== target[at]) differing++;
    }
    return differing;
  }

  /** Builds an index once for each dictionary. */
  private getIndex(words: ReadonlyMap<string, string>): WordIndex {
    let index = this.indexes.get(words);
    if (!index) {
      index = this.buildIndex(words);
      this.indexes.set(words, index);
    }
    return index;
  }

  /** Links the tokens of the word types in a chunk that resolve; returns how many types did. */
  private async linkChunk(
    table: string,
    types: string[],
    words: ReadonlyMap<string, string>,
  ): Promise<number> {
    const data: string[] = [];
    const wordIds: string[] = [];
    for (const type of types) {
      const wordId = this.resolve(type, words);
      if (wordId) {
        data.push(type);
        wordIds.push(wordId);
      }
    }
    if (data.length > 0) {
      await this.tokenRepository.manager.query(
        `UPDATE ${table} AS token SET word_id = link.word_id FROM unnest($1::text[], $2::uuid[]) AS link(data, word_id) WHERE token.data = link.data AND token.word_id IS NULL`,
        [data, wordIds],
      );
    }
    return data.length;
  }

  /** Loads every dictionary word's spelling and id. */
  private async loadWords(): Promise<Map<string, string>> {
    const words = await this.wordRepository.find({
      select: { data: true, id: true },
    });
    return new Map(words.map((word) => [word.data, word.id]));
  }

  /** Chooses the candidate spelled closest to the target, the alphabetically first among equals. */
  private pickClosest(
    candidates: [string, string][] | undefined,
    target: string,
  ): null | string {
    const ranked = (candidates ?? []).toSorted(
      (first, second) =>
        this.distance(first[0], target) - this.distance(second[0], target) ||
        first[0].localeCompare(second[0]),
    );
    return ranked[0]?.[1] ?? null;
  }

  /** Reads an e as the ae or oe of a dictionary word, but never a word that already spells one. */
  private resolveDiphthongs(folded: string, index: WordIndex): null | string {
    const loose = this.normalization.foldDiphthongs(folded);
    return loose === folded
      ? this.pickClosest(index.diphthongs.get(loose), folded)
      : null;
  }

  /** Looks a normalized word up by its folded spelling. */
  private resolveFolded(
    normalized: string,
    folded: string,
    index: WordIndex,
  ): null | string {
    return this.pickClosest(index.folded.get(folded), normalized);
  }

  /** Looks a word up again with its -que, -ve or -ne taken off. */
  private resolveWithoutEnclitic(
    folded: string,
    index: WordIndex,
  ): null | string {
    for (const enclitic of ENCLITIC_SUFFIXES) {
      const base = folded.slice(0, -enclitic.length);
      if (
        folded.endsWith(enclitic) &&
        base.length >= ENCLITIC_MINIMUM_BASE_LENGTH
      ) {
        const wordId = this.resolveFolded(base, base, index);
        if (wordId) return wordId;
      }
    }
    return null;
  }

  // 🌎 Public Methods

  /**
   * Links every unlinked literature word type the dictionary can now explain,
   * a chunk of types at a time, and leaves already linked words as they are.
   */
  public async relinkTokens(): Promise<RelinkSummary> {
    const table = this.tokenRepository.metadata.tablePath;
    const words = await this.loadWords();
    const unlinked = await this.tokenRepository.manager.query<
      { data: string }[]
    >(
      `SELECT data FROM ${table} WHERE word_id IS NULL AND is_punctuation = false GROUP BY data`,
    );
    this.logger.info("🔗 Relinking unlinked word types", undefined, {
      unlinkedTypes: unlinked.length,
    });

    let linkedTypes = 0;
    for (let from = 0; from < unlinked.length; from += RELINK_CHUNK_SIZE) {
      const chunk = unlinked.slice(from, from + RELINK_CHUNK_SIZE);
      linkedTypes += await this.linkChunk(
        table,
        chunk.map(({ data }) => data),
        words,
      );
      this.logger.info("🔗 Relinked word types", undefined, {
        done: Math.min(from + RELINK_CHUNK_SIZE, unlinked.length),
        linkedTypes,
      });
    }
    if (linkedTypes > 0) await this.countRecognisedWords(table);
    return { linkedTypes, unlinkedTypes: unlinked.length };
  }

  /**
   * Resolves a literature word to a dictionary word id, or null when nothing
   * in the dictionary is a defensible spelling of it.
   */
  public resolve(
    token: string,
    words: ReadonlyMap<string, string>,
  ): null | string {
    const normalized = this.normalization.normalize(token);
    const exact = words.get(normalized);
    if (exact) return exact;

    const index = this.getIndex(words);
    const folded = this.normalization.fold(token);
    return (
      this.resolveFolded(normalized, folded, index) ??
      this.resolveWithoutEnclitic(folded, index) ??
      this.resolveDiphthongs(folded, index)
    );
  }
}
