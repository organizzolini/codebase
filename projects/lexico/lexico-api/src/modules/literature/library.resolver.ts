import { Inject } from "@nestjs/common";
import { Args as Arguments, Query, Resolver } from "@nestjs/graphql";

import { LibraryArguments } from "./library-arguments.entities";
import { LibraryPageType } from "./library-page.entities";
import { LibraryService } from "./library.service";
import { parseLibraryArguments, toLibraryPageType } from "./library.utilities";

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

  /** Pages the library's author cards, each with its matching Texts. */
  @Query(() => LibraryPageType, { name: "library" })
  public async library(
    @Arguments() arguments_: LibraryArguments,
  ): Promise<LibraryPageType> {
    const { page, pageSize, search } = parseLibraryArguments(arguments_);
    return toLibraryPageType(
      await this.libraryService.listLibraryPage(search, page, pageSize),
    );
  }

  // 🖋️ Mutations

  // 🔗 Relations
}
