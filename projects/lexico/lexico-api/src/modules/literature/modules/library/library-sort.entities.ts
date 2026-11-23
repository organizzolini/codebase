import { Field, InputType, registerEnumType } from "@nestjs/graphql";

/**
 * An attribute the library can be ordered by. Author attributes order the
 * cards; Text attributes order the Texts within each card.
 */
export enum LibrarySortField {
  AUTHOR_END_YEAR = "AUTHOR_END_YEAR",
  AUTHOR_ERA = "AUTHOR_ERA",
  AUTHOR_FULL_NAME = "AUTHOR_FULL_NAME",
  AUTHOR_NAME = "AUTHOR_NAME",
  AUTHOR_START_YEAR = "AUTHOR_START_YEAR",
  TEXT_COLLECTION = "TEXT_COLLECTION",
  TEXT_EDITION = "TEXT_EDITION",
  TEXT_END_YEAR = "TEXT_END_YEAR",
  TEXT_LINE_COUNT = "TEXT_LINE_COUNT",
  TEXT_PRINT_YEAR = "TEXT_PRINT_YEAR",
  TEXT_RECOGNISED_WORD_COUNT = "TEXT_RECOGNISED_WORD_COUNT",
  TEXT_START_YEAR = "TEXT_START_YEAR",
  TEXT_TITLE = "TEXT_TITLE",
  TEXT_WORD_COUNT = "TEXT_WORD_COUNT",
}

registerEnumType(LibrarySortField, {
  description: "An attribute the library can be ordered by.",
  name: "LibrarySortField",
});

/**
 * An attribute the library's authors are grouped by. Each group leads the
 * order, so an author's group is readable from the author itself.
 */
export enum LibraryGroupField {
  ERA = "ERA",
}

registerEnumType(LibraryGroupField, {
  description: "An attribute the library's authors are grouped by.",
  name: "LibraryGroupField",
});

/** The direction a library page is ordered in. */
export enum LibrarySortDirection {
  ASC = "ASC",
  DESC = "DESC",
}

registerEnumType(LibrarySortDirection, {
  description: "The direction a library page is ordered in.",
  name: "LibrarySortDirection",
});

/** How the library is ordered. Nulls sort last in both directions. */
@InputType("LibrarySort")
export class LibrarySortInput {
  @Field(() => LibrarySortDirection, {
    description: "The direction to order in. Defaults to ascending.",
    nullable: true,
  })
  public direction?: LibrarySortDirection | null;

  @Field(() => LibrarySortField, {
    description: "The attribute to order by.",
  })
  public field!: LibrarySortField;
}
