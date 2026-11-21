import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";

import { PostgresqlDeletableEntity } from "@codebase/persistence";

import { BIGINT_NUMBER_TRANSFORMER } from "./literature.constants";

import type { Author } from "./author.entity";
import type { Line } from "./line.entity";
import type { Relation } from "typeorm";

/** The sources a text can be ingested from. */
export const textCollection = {
  csel: "CSEL",
  edcs: "EDCS",
  perseus: "Perseus",
  theLatinLibrary: "The Latin Library",
} as const;

/** Union of allowed text collection string literals. */
export type TextCollection =
  (typeof textCollection)[keyof typeof textCollection];

export const textCollections = Object.values(
  textCollection,
) as TextCollection[];

/**
 * Represents a text or a collection of texts (like a book or corpus).
 */
@Entity({
  comment: "A hierarchical literary work (corpus, book, text, poem, etc.)",
  name: "texts",
})
export class Text extends PostgresqlDeletableEntity {
  @Index()
  @JoinColumn({ name: "author_id" })
  @ManyToOne("Author", "texts", { eager: true, onDelete: "CASCADE" })
  author!: Relation<Author>;

  @OneToMany("Text", "parentText", { cascade: true })
  childTexts!: Text[];

  @Column({
    comment: "The source the text was ingested from",
    enum: textCollections,
    nullable: true,
    type: "enum",
  })
  @Index()
  collection?: null | TextCollection;

  @Column("varchar", {
    comment: "The edition's name or series, where the source gives one",
    nullable: true,
  })
  edition?: null | string;

  @Column("varchar", {
    comment: "The editors named by the source edition",
    nullable: true,
  })
  editors?: null | string;

  @Column("bigint", {
    comment:
      "The year an inscription is dated from, negative for BCE, null otherwise",
    nullable: true,
    transformer: BIGINT_NUMBER_TRANSFORMER,
  })
  @Index()
  endYear?: null | number;

  @Column("varchar", {
    comment: "The find-spot of an inscription, null otherwise",
    nullable: true,
  })
  findSpot?: null | string;

  @Column("varchar", {
    comment: "The EDCS type of an inscription, null otherwise",
    nullable: true,
  })
  @Index()
  inscriptionType?: null | string;

  @Column("bigint", {
    comment: "The number of lines in the text",
    nullable: true,
    transformer: BIGINT_NUMBER_TRANSFORMER,
  })
  @Index()
  lineCount?: null | number;

  @OneToMany("Line", "text", { cascade: true })
  lines!: Line[];

  @Column("varchar", {
    comment: "The material of an inscription, null otherwise",
    nullable: true,
  })
  @Index()
  material?: null | string;

  @Column("jsonb", { comment: "Unstructured metadata", nullable: true })
  metadata?: null | Record<string, unknown>;

  @Index()
  @JoinColumn({ name: "parent_text_id" })
  @ManyToOne("Text", "childTexts", {
    eager: false,
    nullable: true,
    onDelete: "CASCADE",
  })
  parentText?: null | Relation<Text>;

  @Column("bigint", {
    comment: "The year the edition was printed",
    nullable: true,
    transformer: BIGINT_NUMBER_TRANSFORMER,
  })
  @Index()
  printYear?: null | number;

  @Column("varchar", {
    comment: "The province an inscription was found in, null otherwise",
    nullable: true,
  })
  @Index()
  province?: null | string;

  @Column("varchar", {
    comment: "The publisher of the source edition",
    nullable: true,
  })
  publisher?: null | string;

  @Column("bigint", {
    comment: "The number of Tokens linked to a dictionary Word",
    nullable: true,
    transformer: BIGINT_NUMBER_TRANSFORMER,
  })
  @Index()
  recognisedWordCount?: null | number;

  @Column("varchar", {
    comment: "Unique slug identifier (e.g. 'caesar/de bello gallico')",
    length: 128,
    unique: true,
  })
  slug!: string;

  @Column("bigint", {
    comment:
      "The year an inscription is dated to, negative for BCE, null otherwise",
    nullable: true,
    transformer: BIGINT_NUMBER_TRANSFORMER,
  })
  @Index()
  startYear?: null | number;

  @Column("varchar", { comment: "The title of the text", length: 128 })
  title!: string;

  @Column("varchar", {
    comment:
      "The structural type of the text (e.g. 'book', 'text', 'collection')",
    default: "text",
    length: 32,
  })
  type!: string;

  @Column("bigint", {
    comment: "The number of word Tokens in the text",
    nullable: true,
    transformer: BIGINT_NUMBER_TRANSFORMER,
  })
  @Index()
  wordCount?: null | number;

  @Column("varchar", {
    comment: "The standard work identifier, such as the CTS URN",
    nullable: true,
  })
  workIdentifier?: null | string;
}
