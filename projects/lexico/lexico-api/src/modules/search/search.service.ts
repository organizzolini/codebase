/* cspell:words FULLTEXT ILIKE */

import { performance } from "node:perf_hooks";

import { Injectable } from "@nestjs/common";

import { mapConnection, toCursor } from "@codebase/interface";
import {
  InjectRepository,
  Lexeme,
  type Repository,
  Translation,
  Word,
} from "@codebase/lexico-db";
import { LoggerService } from "@codebase/observability";

import {
  createEmptyConnection,
  paginateQuery,
} from "../literature/literature.utilities";
import { MacronsService } from "../macrons/macrons.service";

import {
  ENGLISH_MATCH_SCORE_EXPRESSION,
  ENGLISH_SEARCH_RESULT_LIMIT,
  LATIN_TIER_RESULT_LIMIT,
  SCORE_ENCLITIC,
  SCORE_FUZZY,
  SCORE_FUZZY_STEP,
  SCORE_LEMMA_EXACT,
  SCORE_PREFIX,
  SCORE_WORD_EXACT,
} from "./search.constants";
import { SearchMatchSource } from "./search.entities";
import {
  decomposeEnclitic,
  formatFormIdentifier,
  fuzzyScoreToDistance,
  maximumFuzzyDistance,
  readSearchCursor,
  toEnglishMatchSource,
  toLatinMatchSource,
  toRankedScore,
} from "./search.utilities";

import type {
  EncliticDecompositionResult,
  LexemeSearchMatch,
  RankedLexemeMatch,
  RankedLexemeQuery,
  ScoredLexeme,
  SearchCursorPayload,
  SearchLogEntry,
  SearchPaginationOptions,
} from "./search.types";
import type { Connection } from "@codebase/interface";

/**
 * Service providing dictionary search across Latin forms and English translations.
 * Every tier is ranked in SQL, and only the requested page of lexemes is ever
 * loaded: the ranking orders by score and then id, and pages by keyset.
 */
@Injectable()
export class SearchService {
  // 🏗 Dependency Injection

  public constructor(
    @InjectRepository(Lexeme)
    private readonly lexemeRepository: Repository<Lexeme>,
    @InjectRepository(Word)
    private readonly wordRepository: Repository<Word>,
    @InjectRepository(Translation)
    private readonly translationRepository: Repository<Translation>,
    private readonly macronsService: MacronsService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SearchService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Creates a lexeme query joining every relation a search result returns.
   */
  private createLexemeQuery(): ReturnType<
    Repository<Lexeme>["createQueryBuilder"]
  > {
    return this.lexemeRepository
      .createQueryBuilder("lexeme")
      .leftJoinAndSelect("lexeme.forms", "forms")
      .leftJoinAndSelect("lexeme.inflection", "inflection")
      .leftJoinAndSelect("lexeme.principalParts", "principalParts")
      .leftJoinAndSelect("lexeme.pronunciations", "pronunciations")
      .leftJoinAndSelect("lexeme.translations", "translations");
  }

  /**
   * Describes each Latin match on a page as merging its tiers would: morphological identifiers, plus any split-off enclitic whose host matched.
   */
  private async describeLatinMatches(
    scored: readonly ScoredLexeme[],
    search: {
      decomposition: EncliticDecompositionResult;
      terms: readonly string[];
    },
  ): Promise<LexemeSearchMatch[]> {
    const { enclitic, host } = search.decomposition;
    if (scored.length === 0) {
      return [];
    }
    const words = await this.wordRepository
      .createQueryBuilder("word")
      .leftJoinAndSelect("word.wordForms", "wordForms")
      .leftJoinAndSelect("wordForms.form", "form")
      .leftJoinAndSelect("form.lexeme", "formLexeme")
      .innerJoinAndSelect("word.wordLexemes", "wordLexemes")
      .innerJoinAndSelect("wordLexemes.lexeme", "linkedLexeme")
      .where("LOWER(word.data) IN (:...latinTerms)", {
        latinTerms: [...search.terms],
      })
      .andWhere("linkedLexeme.id IN (:...lexemeIds)", {
        lexemeIds: scored.map(({ lexeme }) => lexeme.id),
      })
      .getMany();

    const identifiers = new Map<string, Set<string>>();
    for (const term of search.terms) {
      for (const word of words.filter(
        (candidate) => candidate.data.toLowerCase() === term,
      )) {
        for (const { lexeme } of word.wordLexemes) {
          const wordIdentifiers = word.wordForms
            .filter((wordForm) => wordForm.form.lexeme.id === lexeme.id)
            .map((wordForm) => formatFormIdentifier(wordForm.form))
            .filter((identifier) => typeof identifier === "string");
          const merged = identifiers.get(lexeme.id) ?? new Set<string>();
          wordIdentifiers.forEach((identifier) => merged.add(identifier));
          identifiers.set(lexeme.id, merged);
        }
      }
    }
    const hostMatched = new Set([
      ...scored
        .filter(({ lexeme }) => lexeme.lemma.toLowerCase() === host)
        .map(({ lexeme }) => lexeme.id),
      ...words
        .filter((word) => word.data.toLowerCase() === host)
        .flatMap((word) => word.wordLexemes.map(({ lexeme }) => lexeme.id)),
    ]);

    return scored.map(({ lexeme, score }) => {
      const source = toLatinMatchSource(score);
      return {
        distance:
          source === SearchMatchSource.FUZZY
            ? fuzzyScoreToDistance(score)
            : null,
        enclitic: hostMatched.has(lexeme.id) ? enclitic : null,
        identifiers: [...(identifiers.get(lexeme.id) ?? [])],
        lexeme,
        score,
        source,
      };
    });
  }

  /**
   * Selects the lexemes whose lemma is one of the terms, or one of whose
   * inflected words is, as SQL yielding a `lexemeId` column.
   */
  private lemmaOrWordMatches(alias: string, termsParameter: string): string[] {
    return [
      this.lexemeRepository
        .createQueryBuilder(`${alias}Lemma`)
        .select(`${alias}Lemma.id`, "lexemeId")
        .where(`LOWER(${alias}Lemma.lemma) IN (:...${termsParameter})`)
        .getQuery(),
      this.wordRepository
        .createQueryBuilder(`${alias}Word`)
        .innerJoin(`${alias}Word.wordLexemes`, `${alias}Link`)
        .innerJoin(`${alias}Link.lexeme`, `${alias}Lexeme`)
        .select(`${alias}Lexeme.id`, "lexemeId")
        .where(`LOWER(${alias}Word.data) IN (:...${termsParameter})`)
        .getQuery(),
    ];
  }

  /**
   * Logs one completed search with its response time and the lexemes it returned.
   */
  private logSearch({
    connection,
    language,
    query,
    startTime,
  }: SearchLogEntry): void {
    this.logger.info("🔎 Searched dictionary", undefined, {
      language,
      lexemeIds: connection.edges.map((edge) => edge.node.lexeme.id),
      query,
      responseTime: Math.round(performance.now() - startTime),
      totalCount: connection.totalCount,
    });
  }

  /**
   * Pages ranked lexemes in SQL, best score then id first, loading and describing only the page's lexemes.
   */
  private async paginateRankedLexemes(
    ranked: RankedLexemeQuery,
    options: SearchPaginationOptions | undefined,
    describe: (
      scored: ScoredLexeme[],
    ) => LexemeSearchMatch[] | Promise<LexemeSearchMatch[]>,
  ): Promise<Connection<LexemeSearchMatch>> {
    const connection = await paginateQuery<RankedLexemeMatch, Lexeme>(
      {
        cursor: {
          decode: readSearchCursor,
          encode: (position) =>
            toCursor({
              id: position.id,
              score: toRankedScore(position.key),
            } satisfies SearchCursorPayload),
        },
        filter: () =>
          this.lexemeRepository
            .createQueryBuilder("lexeme")
            .innerJoin(
              `(${ranked.sql})`,
              "ranked",
              `ranked."lexemeId" = lexeme.id`,
            )
            .setParameters(ranked.parameters),
        load: async (ids, keys) => {
          const lexemes = await this.createLexemeQuery()
            .where("lexeme.id IN (:...lexemeIds)", { lexemeIds: ids })
            .getMany();
          const matches = await describe(
            lexemes.map((lexeme) => ({
              lexeme,
              score: toRankedScore(keys.get(lexeme.id)),
            })),
          );
          return matches.map((match) => ({ ...match, id: match.lexeme.id }));
        },
        sortKey: "-ranked.score",
      },
      {
        after: options?.after ?? null,
        before: options?.before ?? null,
        first: options?.first ?? null,
        last: options?.last ?? null,
      },
    );

    return mapConnection(
      connection,
      ({ distance, enclitic, identifiers, lexeme, score, source }) => ({
        distance,
        enclitic,
        identifiers,
        lexeme,
        score,
        source,
      }),
    );
  }

  /**
   * Ranks lexemes by their best-matching translation, excluding proper nouns,
   * keeping at most `ENGLISH_SEARCH_RESULT_LIMIT` of them.
   */
  private rankEnglishMatches(
    query: string,
    cleanQuery: string,
  ): RankedLexemeQuery {
    const ranked = this.translationRepository
      .createQueryBuilder("translation")
      .innerJoin("translation.lexeme", "translatedLexeme")
      .select("translatedLexeme.id", "lexemeId")
      .addSelect(`MAX(${ENGLISH_MATCH_SCORE_EXPRESSION})`, "score")
      .where(
        "(LOWER(translation.data) = :exactQuery OR translation.data ILIKE :prefixQuery OR translation.data ILIKE :subQuery OR to_tsvector('english', translation.data) @@ plainto_tsquery('english', :rawQuery))",
      )
      .andWhere("translatedLexeme.partOfSpeech <> :properNoun")
      .setParameters({
        exactQuery: cleanQuery,
        prefixQuery: `${cleanQuery}%`,
        properNoun: "properNoun",
        rawQuery: query,
        subQuery: `%${cleanQuery}%`,
      })
      .groupBy("translatedLexeme.id")
      .orderBy("score", "DESC")
      .addOrderBy("translatedLexeme.id", "ASC")
      .limit(ENGLISH_SEARCH_RESULT_LIMIT);

    return { parameters: ranked.getParameters(), sql: ranked.getQuery() };
  }

  /**
   * Ranks the first `LATIN_TIER_RESULT_LIMIT` lexemes within the fuzzy edit distance, closest first. Trigram similarity narrows candidates through their index first.
   */
  private rankFuzzyMatches(termParameter: string): string {
    const maximum = `:${termParameter}Maximum`;
    const distance = (column: string): string =>
      `levenshtein_less_equal(LOWER(${column}), :${termParameter}, ${maximum})`;
    const lemmas = this.lexemeRepository
      .createQueryBuilder("fuzzyLemma")
      .select("fuzzyLemma.id", "lexemeId")
      .addSelect(distance("fuzzyLemma.lemma"), "distance")
      .where(`LOWER(fuzzyLemma.lemma) % :${termParameter}`)
      .getQuery();
    const words = this.wordRepository
      .createQueryBuilder("fuzzyWord")
      .innerJoin("fuzzyWord.wordLexemes", "fuzzyLink")
      .innerJoin("fuzzyLink.lexeme", "fuzzyLexeme")
      .select("fuzzyLexeme.id", "lexemeId")
      .addSelect(distance("fuzzyWord.data"), "distance")
      .where(`LOWER(fuzzyWord.data) % :${termParameter}`)
      .getQuery();
    return `SELECT "fuzzy"."lexemeId", ${String(SCORE_FUZZY)} - ${String(SCORE_FUZZY_STEP)} * MIN("fuzzy"."distance") AS "score" FROM (${lemmas} UNION ALL ${words}) "fuzzy" WHERE "fuzzy"."distance" <= ${maximum} GROUP BY "fuzzy"."lexemeId" ORDER BY "score" DESC, "fuzzy"."lexemeId" ASC LIMIT ${String(LATIN_TIER_RESULT_LIMIT)}`;
  }

  /**
   * Ranks every Latin tier at once. A lexeme keeps its best tier's score, and one with no translation is dropped.
   */
  private rankLatinMatches(
    terms: readonly string[],
    decomposition: EncliticDecompositionResult,
  ): RankedLexemeQuery {
    const parameters: Record<string, unknown> = {
      latinHost: [decomposition.host],
      latinTerms: [...terms],
    };
    const [lemmas = "", words = ""] = this.lemmaOrWordMatches(
      "match",
      "latinTerms",
    );
    const tiers = [
      `SELECT "lemmaMatch"."lexemeId", ${String(SCORE_LEMMA_EXACT)} AS "score" FROM (${lemmas}) "lemmaMatch"`,
      `SELECT "wordMatch"."lexemeId", ${String(SCORE_WORD_EXACT)} AS "score" FROM (${words}) "wordMatch"`,
    ];

    if (decomposition.enclitic !== null) {
      parameters["encliticLemma"] = `-${decomposition.enclitic}`;
      tiers.push(
        this.lexemeRepository
          .createQueryBuilder("encliticLexeme")
          .select("encliticLexeme.id", "lexemeId")
          .addSelect(String(SCORE_ENCLITIC), "score")
          .where("LOWER(encliticLexeme.lemma) = :encliticLemma")
          .andWhere(
            `EXISTS (SELECT 1 FROM (${this.lemmaOrWordMatches("host", "latinHost").join(" UNION ALL ")}) "hostMatch" WHERE ${this.translatedCondition(`"hostMatch"."lexemeId"`)})`,
          )
          .getQuery(),
      );
    }

    for (const [index, term] of terms.entries()) {
      parameters[`latinPrefix${String(index)}`] = `${term}%`;
      tiers.push(
        this.rankLemmaPattern(`latinPrefix${String(index)}`, SCORE_PREFIX),
      );
      const maximumDistance = maximumFuzzyDistance(term);
      if (maximumDistance > 0) {
        parameters[`latinFuzzy${String(index)}`] = term;
        parameters[`latinFuzzy${String(index)}Maximum`] = maximumDistance;
        tiers.push(this.rankFuzzyMatches(`latinFuzzy${String(index)}`));
      }
    }

    return {
      parameters,
      sql: `SELECT "candidate"."lexemeId" AS "lexemeId", MAX("candidate"."score") AS "score" FROM (${tiers.map((tier) => `(${tier})`).join(" UNION ALL ")}) "candidate" WHERE ${this.translatedCondition(`"candidate"."lexemeId"`)} GROUP BY "candidate"."lexemeId"`,
    };
  }

  /**
   * Ranks the first `LATIN_TIER_RESULT_LIMIT` lexemes by id whose lemma
   * matches a pattern parameter, all at one score.
   */
  private rankLemmaPattern(patternParameter: string, score: number): string {
    const alias = `${patternParameter}Lexeme`;
    return this.lexemeRepository
      .createQueryBuilder(alias)
      .select(`${alias}.id`, "lexemeId")
      .addSelect(String(score), "score")
      .where(`${alias}.lemma ILIKE :${patternParameter}`)
      .orderBy(`${alias}.id`, "ASC")
      .limit(LATIN_TIER_RESULT_LIMIT)
      .getQuery();
  }

  /** A condition holding when the lexeme in a column has a translation. */
  private translatedCondition(column: string): string {
    return `EXISTS (${this.translationRepository
      .createQueryBuilder("ownTranslation")
      .select("1")
      .where(`ownTranslation.lexeme_id = ${column}`)
      .getQuery()})`;
  }

  // 🌎 Public Methods

  /**
   * Searches English translations and definitions using full-text and substring matching.
   */
  public async searchEnglish(
    query: string,
    options?: SearchPaginationOptions,
  ): Promise<Connection<LexemeSearchMatch>> {
    const startTime = performance.now();
    const cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.length === 0) {
      return createEmptyConnection<LexemeSearchMatch>();
    }

    const connection = await this.paginateRankedLexemes(
      this.rankEnglishMatches(query, cleanQuery),
      options,
      (scored) =>
        scored.map(({ lexeme, score }) => ({
          distance: null,
          enclitic: null,
          identifiers: [],
          lexeme,
          score,
          source: toEnglishMatchSource(score),
        })),
    );
    this.logSearch({ connection, language: "english", query, startTime });
    return connection;
  }

  /**
   * Performs tiered Latin dictionary search with enclitic parsing and fuzzy matching.
   */
  public async searchLatin(
    query: string,
    options?: SearchPaginationOptions,
  ): Promise<Connection<LexemeSearchMatch>> {
    const startTime = performance.now();
    const cleanQuery = this.macronsService
      .removeMacrons(query)
      .trim()
      .toLowerCase();
    if (cleanQuery.length === 0) {
      return createEmptyConnection<LexemeSearchMatch>();
    }

    const decomposition = decomposeEnclitic(cleanQuery);
    const terms = [
      ...new Set([cleanQuery, decomposition.host].filter(Boolean)),
    ];
    const connection = await this.paginateRankedLexemes(
      this.rankLatinMatches(terms, decomposition),
      options,
      async (scored) =>
        this.describeLatinMatches(scored, { decomposition, terms }),
    );
    this.logSearch({ connection, language: "latin", query, startTime });
    return connection;
  }
}
