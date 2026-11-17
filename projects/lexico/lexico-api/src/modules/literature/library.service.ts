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
  LIBRARY_WORKS_PER_AUTHOR,
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
  rootScopeClause,
  sortColumnSql,
  sqlClause,
  textOrderSql,
  textScopeClause,
} from "./library.functions";
import { matchRangesOf, searchPatternsOf } from "./library.utilities";

import type {
  LibraryAuthorRecord,
  LibraryFacetsRecord,
  LibraryFacetValueRecord,
  LibraryPageRecord,
  LibraryTextRecord,
  LibraryTextsPageRecord,
  ParsedLibraryArguments,
  ParsedLibraryChildrenArguments,
} from "./library.types";
import type { QueryBuilder } from "./literature.types";

/**
 * Service behind the library queries. Authors are filtered, sorted, paged, and
 * counted in SQL, and their top-level works are fetched in one windowed
 * statement; the children of a work are paged on demand.
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

  /** Counts the children of each Text, keyed by Text id. */
  private async countChildren(ids: string[]): Promise<Map<string, number>> {
    const rows = await this.textRepository
      .createQueryBuilder("child")
      .select("child.parent_text_id", "parentId")
      .addSelect("COUNT(*)", "count")
      .where("child.parent_text_id IN (:...ids)", { ids })
      .groupBy("child.parent_text_id")
      .getRawMany<{ count: string; parentId: string }>();
    return new Map(rows.map((row) => [row.parentId, Number(row.count)]));
  }

  /** Counts each author's top-level works in scope, keyed by author id. */
  private async countWorks(
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

  /** Keeps a Text that has at least one child meeting the clause. */
  private existsChild(clause: LibrarySqlClause): LibrarySqlClause {
    const children = this.textRepository
      .createQueryBuilder("child")
      .select("1")
      .where("child.parent_text_id = text.id")
      .andWhere(clause.sql)
      .getQuery();
    return sqlClause(`EXISTS (${children})`, clause.parameters);
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
   * The distinct non-null values of one indexed Text column with their
   * counts, sorted by value. One grouped index scan; no Text is loaded.
   */
  private async facetValues(
    column: "inscription_type" | "material" | "province",
  ): Promise<LibraryFacetValueRecord[]> {
    const rows = await this.textRepository
      .createQueryBuilder("text")
      .select(`text.${column}`, "value")
      .addSelect("COUNT(*)", "count")
      .where(`text.${column} IS NOT NULL`)
      .groupBy(`text.${column}`)
      .orderBy(`text.${column}`, "ASC")
      .getRawMany<{ count: string; value: string }>();
    return rows.map((row) => ({ count: Number(row.count), value: row.value }));
  }

  /**
   * Loads Texts by id, in the order given, each with its match spans and
   * its child count.
   */
  private async loadRecords(
    ids: string[],
    term: null | string,
  ): Promise<LibraryTextRecord[]> {
    if (ids.length === 0) {
      return [];
    }
    const [texts, childCounts] = await Promise.all([
      this.textRepository.find({
        relations: { author: true, parentText: true },
        where: { id: In(ids) },
      }),
      this.countChildren(ids),
    ]);
    const textsById = new Map(texts.map((text) => [text.id, text]));
    const records: LibraryTextRecord[] = [];
    for (const id of ids) {
      const text = textsById.get(id);
      if (text === undefined) {
        continue;
      }
      records.push({
        childCount: childCounts.get(id) ?? 0,
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
    }
    return records;
  }

  /**
   * Loads each author's top-level works that rank inside a window, in the
   * sort's order. A single windowed statement picks the works, and then they
   * are loaded by id with their author and child counts.
   */
  private async loadWorks(
    authorIds: string[],
    query: ParsedLibraryArguments,
    window: { readonly limit: number; readonly offset: number },
  ): Promise<Map<string, LibraryTextRecord[]>> {
    const { pattern, term } = searchPatternsOf(query.search);
    const ranked = this.scopedTexts(authorIds, pattern, query)
      .select("text.id", "id")
      .addSelect("text.author_id", "author_id")
      .addSelect(
        `ROW_NUMBER() OVER (PARTITION BY text.author_id ORDER BY ${textOrderSql(query.sort)})`,
        "rank_in_author",
      );
    const picked = await this.textRepository.manager
      .createQueryBuilder()
      .select("ranked.id", "id")
      .addSelect("ranked.author_id", "author_id")
      .from(`(${ranked.getQuery()})`, "ranked")
      .where("ranked.rank_in_author > :offset", { offset: window.offset })
      .andWhere("ranked.rank_in_author <= :end", {
        end: window.offset + window.limit,
      })
      .setParameters(ranked.getParameters())
      .orderBy("ranked.rank_in_author", "ASC")
      .getRawMany<{ author_id: string; id: string }>();

    const records = await this.loadRecords(
      picked.map((row) => row.id),
      term,
    );
    const byAuthor = new Map<string, LibraryTextRecord[]>();
    for (const record of records) {
      const works = byAuthor.get(record.text.author.id) ?? [];
      works.push(record);
      byAuthor.set(record.text.author.id, works);
    }
    return byAuthor;
  }

  /**
   * The top-level works of the given authors that the request keeps: a work
   * is kept when it, or any child of it, is in scope. Each author's works are
   * then counted or ranked from this base.
   */
  private scopedTexts(
    authorIds: string[],
    pattern: null | string,
    query: ParsedLibraryArguments,
  ): QueryBuilder<Text> {
    const scope = rootScopeClause(
      "text",
      textScopeClause("text", pattern, query.filters),
      this.existsChild(textScopeClause("child", pattern, query.filters)),
    );
    return this.textRepository
      .createQueryBuilder("text")
      .innerJoin("text.author", "author")
      .where("text.author_id IN (:...authorIds)", { authorIds })
      .andWhere(scope.sql)
      .setParameters(scope.parameters);
  }

  // 🌎 Public Methods

  /**
   * One page of the child Texts of a Text, ordered by the number in the
   * title and then the title, so "Book 2" comes before "Book 10". The
   * search only marks matches; it never narrows the children.
   */
  public async listLibraryChildren(
    query: ParsedLibraryChildrenArguments,
  ): Promise<LibraryTextsPageRecord> {
    const { page, pageSize, parentTextId } = query;
    const { term } = searchPatternsOf(query.search);
    const base = (): QueryBuilder<Text> =>
      this.textRepository
        .createQueryBuilder("text")
        .where("text.parent_text_id = :parentTextId", { parentTextId });
    const totalCount = await base().getCount();
    const picked = await base()
      .select("text.id", "id")
      .orderBy(
        "NULLIF(SUBSTRING(text.title FROM '[0-9]{1,9}'), '')::int",
        "ASC",
        "NULLS LAST",
      )
      .addOrderBy("text.title", "ASC")
      .addOrderBy("text.id", "ASC")
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .getRawMany<{ id: string }>();
    return {
      pageCount: Math.ceil(totalCount / pageSize),
      texts: await this.loadRecords(
        picked.map((row) => row.id),
        term,
      ),
      totalCount,
    };
  }

  /** The values present in the data for the province, type, and material filters. */
  public async listLibraryFacets(): Promise<LibraryFacetsRecord> {
    const [inscriptionTypes, materials, provinces] = await Promise.all([
      this.facetValues("inscription_type"),
      this.facetValues("material"),
      this.facetValues("province"),
    ]);
    return { inscriptionTypes, materials, provinces };
  }

  /**
   * Pages the authors a request keeps, each with its first top-level works in
   * scope. Authors are ordered by the sort, then by name; works by the sort,
   * then by title.
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
        : await this.countWorks(authorIds, pattern, query);
    const works =
      authorIds.length === 0
        ? new Map<string, LibraryTextRecord[]>()
        : await this.loadWorks(authorIds, query, {
            limit: LIBRARY_WORKS_PER_AUTHOR,
            offset: 0,
          });

    const records: LibraryAuthorRecord[] = pageRows.map((author) => ({
      author,
      matches: matchRangesOf(
        { fullName: author.fullName, name: author.name },
        term,
      ),
      workCount: counts.get(author.id) ?? 0,
      works: works.get(author.id) ?? [],
    }));

    return {
      authors: records,
      pageCount: Math.ceil(totalCount / pageSize),
      totalCount,
    };
  }

  /**
   * One page of an author's top-level works in scope, in the order and with
   * the filters and search the library page used.
   */
  public async listLibraryWorks(
    authorId: string,
    query: ParsedLibraryArguments,
  ): Promise<LibraryTextsPageRecord> {
    const { page, pageSize } = query;
    const { pattern } = searchPatternsOf(query.search);
    const [counts, works] = await Promise.all([
      this.countWorks([authorId], pattern, query),
      this.loadWorks([authorId], query, {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }),
    ]);
    const totalCount = counts.get(authorId) ?? 0;
    return {
      pageCount: Math.ceil(totalCount / pageSize),
      texts: works.get(authorId) ?? [],
      totalCount,
    };
  }
}
