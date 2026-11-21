import { Inject } from "@nestjs/common";
import { Args as Arguments, Query, Resolver } from "@nestjs/graphql";

import { LibraryArguments } from "./library-arguments.entities";
import { LibraryChildrenArguments } from "./library-children-arguments.entities";
import { LibraryFacetsType } from "./library-facets.entities";
import { LibraryPageType } from "./library-page.entities";
import { LibraryTextsPageType } from "./library-texts-page.entities";
import { LibraryWorksArguments } from "./library-works-arguments.entities";
import { LIBRARY_WORKS_PAGE_SIZE } from "./library.constants";
import { LibraryService } from "./library.service";
import {
  parseLibraryArguments,
  parseLibraryChildrenArguments,
  toLibraryPageType,
  toLibraryTextsPageType,
} from "./library.utilities";

/**
 * GraphQL resolver for the library: author cards, paged and searched.
 */
@Resolver()
export class LibraryResolver {
  // 🏗 Dependency Injection

  public constructor(
    @Inject(LibraryService)
    private readonly libraryService: LibraryService,
  ) {}

  // 🔎 Queries

  /** Pages the library's author cards, filtered, sorted, and searched. */
  @Query(() => LibraryPageType, { name: "library" })
  public async library(
    @Arguments() arguments_: LibraryArguments,
  ): Promise<LibraryPageType> {
    return toLibraryPageType(
      await this.libraryService.listLibraryPage(
        parseLibraryArguments(arguments_),
      ),
    );
  }

  /** Pages the Texts under a Text, numbered titles in numeric order. */
  @Query(() => LibraryTextsPageType, { name: "libraryChildren" })
  public async libraryChildren(
    @Arguments() arguments_: LibraryChildrenArguments,
  ): Promise<LibraryTextsPageType> {
    return toLibraryTextsPageType(
      await this.libraryService.listLibraryChildren(
        parseLibraryChildrenArguments(arguments_),
      ),
    );
  }

  /** The distinct provinces, inscription types, and materials in the data. */
  @Query(() => LibraryFacetsType, { name: "libraryFacets" })
  public async libraryFacets(): Promise<LibraryFacetsType> {
    return Object.assign(
      new LibraryFacetsType(),
      await this.libraryService.listLibraryFacets(),
    );
  }

  /** Pages one author's top-level works in scope, as its card lists them. */
  @Query(() => LibraryTextsPageType, { name: "libraryWorks" })
  public async libraryWorks(
    @Arguments() arguments_: LibraryWorksArguments,
  ): Promise<LibraryTextsPageType> {
    const { authorId, ...rest } = arguments_;
    return toLibraryTextsPageType(
      await this.libraryService.listLibraryWorks(
        authorId,
        parseLibraryArguments({
          ...rest,
          pageSize: rest.pageSize ?? LIBRARY_WORKS_PAGE_SIZE,
        }),
      ),
    );
  }

  // 🖋️ Mutations

  // 🔗 Relations
}
