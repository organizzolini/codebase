import { ArgsType as ArgumentsType, Field, Int } from "@nestjs/graphql";

import {
  LibraryGroupField,
  LibrarySortInput,
} from "../sort/library-sort.entities";

import { LibraryFiltersInput } from "./library-filters.entities";

/** Arguments for one page of the library: search, filters, sort, and page. */
@ArgumentsType()
export class LibraryArguments {
  @Field(() => LibraryFiltersInput, {
    description: "Narrows the authors and Texts the library keeps.",
    nullable: true,
  })
  public filters?: LibraryFiltersInput | null;

  @Field(() => [LibraryGroupField], {
    description:
      "The attributes to group authors by, first is the outermost. Each leads the order.",
    nullable: true,
  })
  public group?: LibraryGroupField[] | null;

  @Field(() => Int, {
    description: "The 1-based page to return. Defaults to 1.",
    nullable: true,
  })
  public page?: null | number;

  @Field(() => Int, {
    description: "Authors per page. Defaults to 24, at most 100.",
    nullable: true,
  })
  public pageSize?: null | number;

  @Field(() => String, {
    description:
      "Matches every searchable attribute of authors and texts. Blank means no search.",
    nullable: true,
  })
  public search?: null | string;

  @Field(() => [LibrarySortInput], {
    description:
      "The attributes to order by, first is the primary key. Defaults to author name.",
    nullable: true,
  })
  public sort?: LibrarySortInput[] | null;
}
