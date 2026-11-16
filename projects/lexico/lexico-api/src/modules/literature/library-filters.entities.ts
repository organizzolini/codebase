import { Field, InputType, registerEnumType } from "@nestjs/graphql";

import { AUTHOR_ERA_MEMBERS } from "./author.entities";
import { LibraryRangeInput } from "./library-range.entities";
import { TEXT_COLLECTION_MEMBERS } from "./text.entities";

import type { AuthorEra, TextCollection } from "@codebase/lexico-db";

/**
 * Which kind of Text a library filter keeps: a book, or any other Text. A
 * book is a Text whose type is `book`.
 */
export enum LibraryTextKind {
  BOOK = "BOOK",
  TEXT = "TEXT",
}

registerEnumType(LibraryTextKind, {
  description: "Whether a Text is a book or any other Text.",
  name: "LibraryTextKind",
});

/**
 * Filters on the library. Each filter narrows the Texts an author card
 * carries; an author's own attributes filter the card itself. Filters combine
 * with each other and with search using AND. An empty list filters nothing.
 */
@InputType("LibraryFilters")
export class LibraryFiltersInput {
  @Field(() => LibraryRangeInput, {
    description:
      "Authors whose years overlap this range. Authors missing a start or end year are left out, even when the range has one bound.",
    nullable: true,
  })
  public authorYears?: LibraryRangeInput | null;

  @Field(() => [TEXT_COLLECTION_MEMBERS], {
    description: "Texts from any of these collections.",
    nullable: true,
  })
  public collections?: null | TextCollection[];

  @Field(() => [AUTHOR_ERA_MEMBERS], {
    description: "Authors in any of these eras.",
    nullable: true,
  })
  public eras?: AuthorEra[] | null;

  @Field(() => [String], {
    description: "Inscriptions of any of these EDCS types.",
    nullable: true,
  })
  public inscriptionTypes?: null | string[];

  @Field(() => LibraryRangeInput, {
    description:
      "Inscriptions whose dating overlaps this range. Texts missing a start or end year are left out, even when the range has one bound.",
    nullable: true,
  })
  public inscriptionYears?: LibraryRangeInput | null;

  @Field(() => [LibraryTextKind], {
    description: "Texts of any of these kinds.",
    nullable: true,
  })
  public kinds?: LibraryTextKind[] | null;

  @Field(() => LibraryRangeInput, {
    description: "Texts with a line count in this range.",
    nullable: true,
  })
  public lineCount?: LibraryRangeInput | null;

  @Field(() => [String], {
    description: "Inscriptions made of any of these materials.",
    nullable: true,
  })
  public materials?: null | string[];

  @Field(() => LibraryRangeInput, {
    description: "Texts whose edition was printed in this range.",
    nullable: true,
  })
  public printYears?: LibraryRangeInput | null;

  @Field(() => [String], {
    description: "Inscriptions found in any of these provinces.",
    nullable: true,
  })
  public provinces?: null | string[];

  @Field(() => LibraryRangeInput, {
    description: "Texts with a word count in this range.",
    nullable: true,
  })
  public wordCount?: LibraryRangeInput | null;
}
