import { Injectable } from "@nestjs/common";

import {
  Author,
  In,
  InjectRepository,
  type Repository,
  Text,
} from "@codebase/lexico-db";

import { LibrarySortField } from "./library-sort.entities";
import {
  LIBRARY_SORT_COLUMNS,
  LIBRARY_TEXTS_PER_AUTHOR,
} from "./library.constants";
import {
  andClauses,
  authorFilterClause,
  firstTextAggregate,
  hasTextFilters,
  type LibrarySqlClause,
  matchAuthorClause,
  matchTextClause,
  orClauses,
  orderDirection,
  sortColumnSql,
  sqlClause,
  textOrderSql,
  textScopeClause,
} from "./library.functions";
import { matchRangesOf, searchPatternsOf } from "./library.utilities";

import type {
  LibraryAuthorRecord,
  LibraryPageRecord,
  LibraryTextRecord,
  ParsedLibraryArguments,
} from "./library.types";
import type { QueryBuilder } from "./literature.types";

/**
 * Service behind the library query. Authors are filtered, sorted, paged, and
 * counted in SQL, and their Texts are fetched in one windowed statement, so no
 * page loads more than its authors' capped Texts.
 */
@Injectable()
export class LibraryService {
  // 🏗 Dependency Injection

  public constructor(
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    @InjectRepository(Text)
    private readonly textRepository: Repository<Text>,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * The value each card is ordered by. An author attribute is read directly;
   * a Text attribute takes the card's first Text under the sort, which is the
   * smallest value ascending and the largest descending. Nulls are ignored
   * by the aggregate, so a card with no value sorts last.
   */
  private authorOrderKey(
    query: ParsedLibraryArguments,
    pattern: null | string,
  ): LibrarySqlClause {
    const { sort } = query;
    if (LIBRARY_SORT_COLUMNS[sort.field].scope === "author") {
      return sqlClause(sortColumnSql(sort.field, "author"));
    }
    const scope = textScopeClause("sub", pattern, query.filters);
    const aggregate = firstTextAggregate(sort.direction);
    const texts = this.textRepository
      .createQueryBuilder("sub")
      .select(`${aggregate}(${sortColumnSql(sort.field, "sub")})`)
      .where("sub.author_id = author.id")
      .andWhere(scope.sql)
      .getQuery();
    return sqlClause(`(${texts})`, scope.parameters);
  }

  /** A fresh query over the authors that the scope keeps. */
  private authorQuery(scope: LibrarySqlClause): QueryBuilder<Author> {
    return this.authorRepository
      .createQueryBuilder("author")
      .where(scope.sql)
      .setParameters(scope.parameters);
  }

  /**
   * The authors a request keeps: those whose own attributes pass the
   * filters, that the search matched, and that carry a Text in scope.
   */
  private authorScope(
    query: ParsedLibraryArguments,
    pattern: null | string,
  ): LibrarySqlClause {
    const clauses = [authorFilterClause(query.filters)];
    if (pattern !== null) {
      clauses.push(
        orClauses([
          matchAuthorClause(pattern),
          this.existsText(matchTextClause("sub", pattern)),
        ]),
      );
    }
    if (hasTextFilters(query.filters)) {
      clauses.push(
        this.existsText(textScopeClause("sub", pattern, query.filters)),
      );
    }
    return andClauses(clauses);
  }

  /** Counts each author's Texts in scope, keyed by author id. */
  private async countTexts(
    authorIds: string[],
    pattern: null | string,
    query: ParsedLibraryArguments,
  ): Promise<Map<string, number>> {
    const rows = await this.scopedTexts(authorIds, pattern, query)
      .select("author.id", "authorId")
      .addSelect("COUNT(*)", "count")
      .groupBy("author.id")
      .getRawMany<{ authorId: string; count: string }>();
    return new Map(rows.map((row) => [row.authorId, Number(row.count)]));
  }

  /** Keeps an author that has at least one Text meeting the clause. */
  private existsText(clause: LibrarySqlClause): LibrarySqlClause {
    const texts = this.textRepository
      .createQueryBuilder("sub")
      .select("1")
      .where("sub.author_id = author.id")
      .andWhere(clause.sql)
      .getQuery();
    return sqlClause(`EXISTS (${texts})`, clause.parameters);
  }

  /**
   * Loads the Texts each author carries, in the sort's order and capped per
   * author. A single windowed statement picks the Texts, and then they are
   * loaded by id with their author and book.
   */
  private async loadTexts(
    authorIds: string[],
    query: ParsedLibraryArguments,
  ): Promise<Map<string, LibraryTextRecord[]>> {
    const { pattern, term } = searchPatternsOf(query.search);
    const ranked = this.scopedTexts(authorIds, pattern, query)
      .select("text.id", "id")
      .addSelect(
        `ROW_NUMBER() OVER (PARTITION BY text.author_id ORDER BY ${textOrderSql(query.sort)})`,
        "rank_in_author",
      );
    const picked = await this.textRepository.manager
      .createQueryBuilder()
      .select("ranked.id", "id")
      .addSelect("ranked.rank_in_author", "rank_in_author")
      .from(`(${ranked.getQuery()})`, "ranked")
      .where("ranked.rank_in_author <= :limit", {
        limit: LIBRARY_TEXTS_PER_AUTHOR,
      })
      .setParameters(ranked.getParameters())
      .orderBy("ranked.rank_in_author", "ASC")
      .getRawMany<{ id: string }>();

    if (picked.length === 0) {
      return new Map();
    }
    const texts = await this.textRepository.find({
      relations: { author: true, parentText: true },
      where: { id: In(picked.map((row) => row.id)) },
    });
    const textsById = new Map(texts.map((text) => [text.id, text]));

    const byAuthor = new Map<string, LibraryTextRecord[]>();
    for (const { id } of picked) {
      const text = textsById.get(id);
      if (text === undefined) {
        continue;
      }
      const records = byAuthor.get(text.author.id) ?? [];
      records.push({
        matches: matchRangesOf(
          {
            collection: text.collection,
            edition: text.edition,
            editors: text.editors,
            findSpot: text.findSpot,
            inscriptionType: text.inscriptionType,
            material: text.material,
            province: text.province,
            title: text.title,
          },
          term,
        ),
        text,
      });
      byAuthor.set(text.author.id, records);
    }
    return byAuthor;
  }

  /**
   * The Texts of the given authors that the request keeps, with the scope
   * applied. Each author's Texts are then counted or ranked from this base.
   */
  private scopedTexts(
    authorIds: string[],
    pattern: null | string,
    query: ParsedLibraryArguments,
  ): QueryBuilder<Text> {
    const scope = textScopeClause("text", pattern, query.filters);
    return this.textRepository
      .createQueryBuilder("text")
      .innerJoin("text.author", "author")
      .where("text.author_id IN (:...authorIds)", { authorIds })
      .andWhere(scope.sql)
      .setParameters(scope.parameters);
  }

  // 🌎 Public Methods

  /**
   * Pages the authors a request keeps, each with its Texts in scope. Authors
   * are ordered by the sort, then by name; Texts by the sort, then by title.
   */
  public async listLibraryPage(
    query: ParsedLibraryArguments,
  ): Promise<LibraryPageRecord> {
    const { page, pageSize, sort } = query;
    const { pattern, term } = searchPatternsOf(query.search);

    const scope = this.authorScope(query, pattern);
    const totalCount = await this.authorQuery(scope).getCount();

    const key = this.authorOrderKey(query, pattern);
    const ordered = this.authorQuery(scope)
      .setParameters(key.parameters)
      .orderBy(key.sql, orderDirection(sort.direction), "NULLS LAST");
    // TypeORM keys its order-by list by expression, so a name tiebreak would
    // overwrite a name sort's direction; the name key already orders by name.
    if (sort.field !== LibrarySortField.AUTHOR_NAME) {
      ordered.addOrderBy("author.name", "ASC");
    }
    const pageRows = await ordered
      .addOrderBy("author.id", "ASC")
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .getMany();

    const authorIds = pageRows.map((author) => author.id);
    const counts =
      authorIds.length === 0
        ? new Map<string, number>()
        : await this.countTexts(authorIds, pattern, query);
    const texts =
      authorIds.length === 0
        ? new Map<string, LibraryTextRecord[]>()
        : await this.loadTexts(authorIds, query);

    const records: LibraryAuthorRecord[] = pageRows.map((author) => ({
      author,
      matches: matchRangesOf(
        { fullName: author.fullName, name: author.name },
        term,
      ),
      textCount: counts.get(author.id) ?? 0,
      texts: texts.get(author.id) ?? [],
    }));

    return {
      authors: records,
      pageCount: Math.ceil(totalCount / pageSize),
      totalCount,
    };
  }
}
