import { Inject } from "@nestjs/common";
import {
  Args as Arguments,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";

import { mapConnection, mapNullableRelation } from "@codebase/interface";

import { PaginationArguments } from "../../../search/modules/search-arguments/pagination-arguments.entities";
import { LiteratureService } from "../../literature.service";
import { toLineType, toTextType } from "../../literature.utilities";
import {
  LineConnectionType,
  TextConnectionType,
} from "../connections/literature-connection.entities";
import { LiteratureRelationsLoader } from "../relations/literature-relations.loader";
import { SearchTextsArguments } from "../search/search-texts-arguments.entities";

import { TextArguments } from "./text-argument.entities";
import { TextType } from "./text.entities";
import { TextsArguments } from "./texts-arguments.entities";

import type { LineType } from "../lines/line.entities";
import type { Connection } from "@codebase/interface";

/**
 * GraphQL resolver for Texts.
 */
@Resolver(() => TextType)
export class TextsResolver {
  // 🏗 Dependency Injection

  public constructor(
    @Inject(LiteratureService)
    private readonly literatureService: LiteratureService,
    @Inject(LiteratureRelationsLoader)
    private readonly literatureRelationsLoader: LiteratureRelationsLoader,
  ) {}

  // 🔎 Queries

  /** Resolves a text's ancestors, root first: empty for a top-level text. */
  @ResolveField(() => [TextType], { name: "ancestors" })
  public async ancestors(@Parent() text: TextType): Promise<TextType[]> {
    const ancestors = await this.literatureRelationsLoader.ancestorsByText.load(
      text.id,
    );
    return ancestors.map((ancestor) => toTextType(ancestor));
  }

  /**
   * Pages the child texts under the current text, ordered like the `texts`
   * query. The children of every text in a response are loaded together.
   */
  @ResolveField(() => TextConnectionType, { name: "childTexts" })
  public async childTexts(
    @Parent() text: TextType,
    @Arguments() arguments_: PaginationArguments,
  ): Promise<Connection<TextType>> {
    const childTexts =
      await this.literatureRelationsLoader.childTextsByParent.load({
        pagination: arguments_,
        parentId: text.id,
      });
    return mapConnection(childTexts, toTextType);
  }

  /**
   * Pages a text's lines in index order, loading every text's lines in a response together.
   */
  @ResolveField(() => LineConnectionType, { name: "lines" })
  public async linesForText(
    @Parent() text: TextType,
    @Arguments() arguments_: PaginationArguments,
  ): Promise<Connection<LineType>> {
    const lines = await this.literatureRelationsLoader.linesByText.load({
      pagination: arguments_,
      parentId: text.id,
    });
    return mapConnection(lines, toLineType);
  }

  /**
   * Resolves a text's next sibling under the same parent, null at the last
   * sibling and for a top-level text.
   */
  @ResolveField(() => TextType, { name: "nextText", nullable: true })
  public async nextText(@Parent() text: TextType): Promise<null | TextType> {
    const { next } = await this.literatureRelationsLoader.siblingsByText.load(
      text.id,
    );
    return mapNullableRelation(next, toTextType) ?? null;
  }

  /**
   * Resolves a nested text's parent: a joined parent, even null, is used as is; otherwise it is loaded with the response's other parents.
   */
  @ResolveField(() => TextType, { name: "parentText", nullable: true })
  public async parentText(@Parent() text: TextType): Promise<null | TextType> {
    if (text.parentText !== undefined) {
      return text.parentText;
    }

    const parent = await this.literatureRelationsLoader.parentTextByText.load(
      text.id,
    );
    return mapNullableRelation(parent, toTextType) ?? null;
  }

  /**
   * Resolves a text's previous sibling under the same parent, null at the first
   * sibling and for a top-level text.
   */
  @ResolveField(() => TextType, { name: "previousText", nullable: true })
  public async previousText(
    @Parent() text: TextType,
  ): Promise<null | TextType> {
    const { previous } =
      await this.literatureRelationsLoader.siblingsByText.load(text.id);
    return mapNullableRelation(previous, toTextType) ?? null;
  }

  // 🖋️ Mutations

  // 🔗 Relations

  /** Searches texts by title or slug. */
  @Query(() => TextConnectionType, { name: "searchTexts" })
  public async searchTexts(
    @Arguments() arguments_: SearchTextsArguments,
  ): Promise<Connection<TextType>> {
    const texts = await this.literatureService.searchTexts(
      arguments_.query,
      arguments_.authorId,
      arguments_,
    );
    return mapConnection(texts, toTextType);
  }

  /**
   * Finds a text by ID or slug.
   */
  @Query(() => TextType, { name: "text", nullable: true })
  public async text(
    @Arguments() arguments_: TextArguments,
  ): Promise<null | TextType> {
    const resolvedId = arguments_.lookup?.id ?? arguments_.id;
    const resolvedSlug = arguments_.lookup?.slug ?? arguments_.slug;

    if (!resolvedId && !resolvedSlug) {
      return null;
    }

    const text = await this.literatureService.findTextByLookup(
      resolvedId,
      resolvedSlug,
    );
    return text === null ? null : toTextType(text);
  }

  /** Lists texts with optional author and parent filters. */
  @Query(() => TextConnectionType, { name: "texts" })
  public async texts(
    @Arguments() arguments_: TextsArguments,
  ): Promise<Connection<TextType>> {
    const texts = await this.literatureService.listTextsConnection(
      arguments_.authorId,
      arguments_.parentTextId,
      arguments_,
    );
    return mapConnection(texts, toTextType);
  }
}
