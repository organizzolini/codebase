import { Injectable } from "@nestjs/common";

import {
  In,
  InjectRepository,
  Line,
  type Repository,
  Text,
  Token,
} from "@codebase/lexico-db";

import { paginateQueryByParent } from "./literature-relations.utilities";

import type { PaginationArguments } from "../search/pagination-arguments.entities";
import type {
  AncestorLink,
  SiblingNeighbors,
  TextSiblings,
} from "./literature.types";
import type { Connection } from "@codebase/interface";

/**
 * Service resolving the relations beneath many authors, texts, and lines at
 * once — a page of lines' tokens, a list of texts' lines and children, each
 * one's parent — so a nested query costs a fixed number of statements however
 * many rows it fans out to.
 */
@Injectable()
export class LiteratureRelationsService {
  // 🏗 Dependency Injection

  public constructor(
    @InjectRepository(Line)
    private readonly lineRepository: Repository<Line>,
    @InjectRepository(Text)
    private readonly textRepository: Repository<Text>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Selects texts with their author and parent's author joined in, avoiding per-row lookups.
   */
  private selectTexts(): ReturnType<Repository<Text>["createQueryBuilder"]> {
    return this.textRepository
      .createQueryBuilder("text")
      .leftJoinAndSelect("text.author", "textAuthor")
      .leftJoinAndSelect("text.parentText", "textParent")
      .leftJoinAndSelect("textParent.author", "textParentAuthor");
  }

  // 🌎 Public Methods

  /**
   * Finds each text's ancestors, root first, with their authors, in two
   * statements however many texts ask: the chain of parent ids, then the rows.
   * A top-level text has none.
   */
  public async findAncestorTexts(
    textIds: readonly string[],
  ): Promise<Map<string, Text[]>> {
    if (textIds.length === 0) {
      return new Map();
    }

    const links = await this.textRepository.query<AncestorLink[]>(
      `WITH RECURSIVE "chain" AS (
        SELECT "text"."id" AS "origin", "parent"."id" AS "ancestorId", "parent"."parent_text_id" AS "parentId", 1 AS "depth"
        FROM "texts" "text"
        INNER JOIN "texts" "parent" ON "parent"."id" = "text"."parent_text_id"
        WHERE "text"."id" = ANY($1::uuid[]) AND "parent"."deleted_at" IS NULL
        UNION ALL
        SELECT "chain"."origin", "parent"."id", "parent"."parent_text_id", "chain"."depth" + 1
        FROM "chain"
        INNER JOIN "texts" "parent" ON "parent"."id" = "chain"."parentId"
        WHERE "parent"."deleted_at" IS NULL
      )
      SELECT "origin", "ancestorId", "depth" FROM "chain"`,
      [[...textIds]],
    );
    const ancestors = await this.textRepository.find({
      where: { id: In([...new Set(links.map((link) => link.ancestorId))]) },
    });
    const ancestorsById = new Map(ancestors.map((text) => [text.id, text]));

    const ancestorsByText = new Map<string, Text[]>();
    for (const link of links.toSorted((a, b) => b.depth - a.depth)) {
      const ancestor = ancestorsById.get(link.ancestorId);
      if (ancestor !== undefined) {
        ancestorsByText.set(link.origin, [
          ...(ancestorsByText.get(link.origin) ?? []),
          ancestor,
        ]);
      }
    }
    return ancestorsByText;
  }

  /**
   * Finds each text's parent text, with that parent's author, in one
   * statement: null for a top-level text, and absent for an unknown one.
   */
  public async findParentTexts(
    textIds: readonly string[],
  ): Promise<Map<string, null | Text>> {
    if (textIds.length === 0) {
      return new Map();
    }

    const texts = await this.textRepository.find({
      relations: { parentText: { author: true } },
      where: { id: In([...textIds]) },
    });
    return new Map(texts.map((text) => [text.id, text.parentText ?? null]));
  }

  /**
   * Finds each text's previous and next sibling, in the order its parent's
   * child texts are listed, in two statements however many texts ask. Null at
   * either end, and for a top-level text, which has no siblings.
   */
  public async findSiblingTexts(
    textIds: readonly string[],
  ): Promise<Map<string, TextSiblings>> {
    if (textIds.length === 0) {
      return new Map();
    }

    const neighbors = await this.textRepository.query<SiblingNeighbors[]>(
      `WITH "siblings" AS (
        SELECT "text"."id",
          LAG("text"."id") OVER "ordered" AS "previousId",
          LEAD("text"."id") OVER "ordered" AS "nextId"
        FROM "texts" "text"
        WHERE "text"."deleted_at" IS NULL AND "text"."parent_text_id" IN (
          SELECT "origin"."parent_text_id" FROM "texts" "origin"
          WHERE "origin"."id" = ANY($1::uuid[]) AND "origin"."parent_text_id" IS NOT NULL
        )
        WINDOW "ordered" AS (PARTITION BY "text"."parent_text_id" ORDER BY "text"."title", "text"."id")
      )
      SELECT "id", "previousId", "nextId" FROM "siblings" WHERE "id" = ANY($1::uuid[])`,
      [[...textIds]],
    );
    const neighborIds = neighbors.flatMap((neighbor) => [
      neighbor.previousId,
      neighbor.nextId,
    ]);
    const siblings = await this.textRepository.find({
      where: {
        id: In([...new Set(neighborIds.filter((id) => id !== null))]),
      },
    });
    const siblingsById = new Map(siblings.map((text) => [text.id, text]));

    return new Map(
      neighbors.map((neighbor) => [
        neighbor.id,
        {
          next: siblingsById.get(neighbor.nextId ?? "") ?? null,
          previous: siblingsById.get(neighbor.previousId ?? "") ?? null,
        },
      ]),
    );
  }

  /** Pages the child texts of many parent texts at once, in title order. */
  public async listChildTextsByParent(
    parentTextIds: readonly string[],
    pagination?: PaginationArguments,
  ): Promise<Map<string, Connection<Text>>> {
    return paginateQueryByParent(
      {
        alias: "text",
        load: () => this.selectTexts(),
        parentKey: "text.parent_text_id",
        parentOf: (text) => text.parentText?.id,
        repository: this.textRepository,
        sortKey: "text.title",
      },
      parentTextIds,
      pagination,
    );
  }

  /** Pages the lines of many texts at once, in index order. */
  public async listLinesByText(
    textIds: readonly string[],
    pagination?: PaginationArguments,
  ): Promise<Map<string, Connection<Line>>> {
    return paginateQueryByParent(
      {
        alias: "line",
        load: () =>
          this.lineRepository
            .createQueryBuilder("line")
            .leftJoinAndSelect("line.author", "lineAuthor")
            .leftJoinAndSelect("line.text", "lineText")
            .leftJoinAndSelect("lineText.author", "lineTextAuthor"),
        parentKey: "line.text_id",
        parentOf: (line) => line.text.id,
        repository: this.lineRepository,
        sortKey: "line.index",
      },
      textIds,
      pagination,
    );
  }

  /** Pages the texts of many authors at once, in title order. */
  public async listTextsByAuthor(
    authorIds: readonly string[],
    pagination?: PaginationArguments,
  ): Promise<Map<string, Connection<Text>>> {
    return paginateQueryByParent(
      {
        alias: "text",
        load: () => this.selectTexts(),
        parentKey: "text.author_id",
        parentOf: (text) => text.author.id,
        repository: this.textRepository,
        sortKey: "text.title",
      },
      authorIds,
      pagination,
    );
  }

  /**
   * Pages the tokens of many lines at once, in index order, joining each
   * token's dictionary word into the same statement.
   */
  public async listTokensByLine(
    lineIds: readonly string[],
    pagination?: PaginationArguments,
  ): Promise<Map<string, Connection<Token>>> {
    return paginateQueryByParent(
      {
        alias: "token",
        load: () =>
          this.tokenRepository
            .createQueryBuilder("token")
            .leftJoinAndSelect("token.author", "tokenAuthor")
            .leftJoinAndSelect("token.line", "tokenLine")
            .leftJoinAndSelect("tokenLine.text", "tokenLineText")
            .leftJoinAndSelect("tokenLineText.author", "tokenLineTextAuthor")
            .leftJoinAndSelect("token.text", "tokenText")
            .leftJoinAndSelect("tokenText.author", "tokenTextAuthor")
            .leftJoinAndSelect("token.word", "tokenWord"),
        parentKey: "token.line_id",
        parentOf: (token) => token.line.id,
        repository: this.tokenRepository,
        sortKey: "token.index",
      },
      lineIds,
      pagination,
    );
  }
}
