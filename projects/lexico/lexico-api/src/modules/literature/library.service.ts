import { Injectable } from "@nestjs/common";

import {
  Author,
  In,
  InjectRepository,
  type Repository,
  Text,
} from "@codebase/lexico-db";

import {
  LIBRARY_TEXT_SEARCH_COLUMNS,
  LIBRARY_TEXTS_PER_AUTHOR,
} from "./library.constants";
import { escapeLikePattern, matchRangesOf } from "./library.utilities";

import type {
  LibraryAuthorRecord,
  LibraryPageRecord,
  LibraryTextRecord,
} from "./library.types";
import type { QueryBuilder } from "./literature.types";

/**
 * Service behind the library query. Authors are paged and counted in SQL, and
 * their Texts are fetched in one windowed statement, so no page loads more
 * than its authors' capped Texts.
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

  /** Matches an author by name or full name, on the `author` alias. */
  private authorMatchSql(): string {
    return "(LOWER(author.name) LIKE :pattern OR LOWER(author.full_name) LIKE :pattern)";
  }

  /** Counts each author's Texts in scope, keyed by author id. */
  private async countTexts(
    authorIds: string[],
    pattern: null | string,
  ): Promise<Map<string, number>> {
    const rows = await this.textScope(authorIds, pattern)
      .select("author.id", "authorId")
      .addSelect("COUNT(*)", "count")
      .groupBy("author.id")
      .getRawMany<{ authorId: string; count: string }>();
    return new Map(rows.map((row) => [row.authorId, Number(row.count)]));
  }

  /**
   * Loads the Texts each author carries, in title order and capped per
   * author. A single windowed statement picks the Texts, and then they are
   * loaded by id with their author and book.
   */
  private async loadTexts(
    authorIds: string[],
    pattern: null | string,
    term: null | string,
  ): Promise<Map<string, LibraryTextRecord[]>> {
    const ranked = this.textScope(authorIds, pattern)
      .select("text.id", "id")
      .addSelect(
        "ROW_NUMBER() OVER (PARTITION BY text.author_id ORDER BY text.title, text.id)",
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

  /** The Texts a search can select an author through, as a subquery. */
  private matchingTextSubquery(): string {
    return this.textRepository
      .createQueryBuilder("sub")
      .select("1")
      .where("sub.author_id = author.id")
      .andWhere(this.textMatchSql("sub"))
      .getQuery();
  }

  /** Matches a Text by any searchable column, on the given alias. */
  private textMatchSql(alias: string): string {
    const columns = LIBRARY_TEXT_SEARCH_COLUMNS.map(
      (column) => `LOWER(${alias}.${column}) LIKE :pattern`,
    );
    columns.push(`LOWER(CAST(${alias}.collection AS TEXT)) LIKE :pattern`);
    return `(${columns.join(" OR ")})`;
  }

  /**
   * The Texts of the given authors that the search keeps: every Text of an
   * author the search matched, and otherwise only the matching Texts.
   */
  private textScope(
    authorIds: string[],
    pattern: null | string,
  ): QueryBuilder<Text> {
    const texts = this.textRepository
      .createQueryBuilder("text")
      .innerJoin("text.author", "author")
      .where("text.author_id IN (:...authorIds)", { authorIds });
    if (pattern !== null) {
      texts.andWhere(
        `(${this.authorMatchSql()} OR ${this.textMatchSql("text")})`,
        { pattern },
      );
    }
    return texts;
  }

  // 🌎 Public Methods

  /**
   * Pages the authors that match a search, with each author's matching Texts.
   * With no search every author is listed, in name order.
   */
  public async listLibraryPage(
    search: null | string,
    page: number,
    pageSize: number,
  ): Promise<LibraryPageRecord> {
    const term = search?.toLowerCase() ?? null;
    const pattern = term === null ? null : `%${escapeLikePattern(term)}%`;

    const authors = this.authorRepository.createQueryBuilder("author");
    if (pattern !== null) {
      authors.where(
        `(${this.authorMatchSql()} OR EXISTS (${this.matchingTextSubquery()}))`,
        { pattern },
      );
    }
    const totalCount = await authors.getCount();
    const pageRows = await authors
      .orderBy("author.name", "ASC")
      .addOrderBy("author.id", "ASC")
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .getMany();

    const authorIds = pageRows.map((author) => author.id);
    const counts =
      authorIds.length === 0
        ? new Map<string, number>()
        : await this.countTexts(authorIds, pattern);
    const texts =
      authorIds.length === 0
        ? new Map<string, LibraryTextRecord[]>()
        : await this.loadTexts(authorIds, pattern, term);

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
