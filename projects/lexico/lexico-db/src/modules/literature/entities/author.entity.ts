import { Column, Entity, Index, OneToMany } from "typeorm";

import { PostgresqlDeletableEntity } from "@codebase/persistence";

import { BIGINT_NUMBER_TRANSFORMER } from "../literature.constants";

import type { Text } from "./text.entity";

/** The periods an author is grouped into for filtering and sorting. */
export const authorEra = {
  archaic: "Archaic",
  classical: "Classical",
  imperial: "Imperial",
  late: "Late",
  medieval: "Medieval",
  neoLatin: "Neo-Latin",
} as const;

/** Union of allowed author era string literals. */
export type AuthorEra = (typeof authorEra)[keyof typeof authorEra];

export const authorEras = Object.values(authorEra) as AuthorEra[];

/**
 * Represents an author of Latin literature.
 */
@Entity({
  comment: "An author of Latin literature",
  name: "authors",
})
export class Author extends PostgresqlDeletableEntity {
  @Column("bigint", {
    comment: "The year the author died, or their floruit end, negative for BCE",
    nullable: true,
    transformer: BIGINT_NUMBER_TRANSFORMER,
  })
  @Index()
  endYear?: null | number;

  @Column({
    comment:
      "The period the author belongs to, derived from startYear and endYear",
    enum: authorEras,
    nullable: true,
    type: "enum",
  })
  @Index()
  era?: AuthorEra | null;

  @Column("varchar", {
    comment: "The author's full name, where the source gives one",
    length: 128,
    nullable: true,
  })
  fullName?: null | string;

  @Column("jsonb", { comment: "Unstructured metadata", nullable: true })
  metadata?: null | Record<string, unknown>;

  @Column("varchar", { comment: "The display name of the author", length: 64 })
  @Index()
  name!: string;

  @Column("varchar", {
    comment: "Unique slug identifier (e.g. 'caesar')",
    length: 64,
    unique: true,
  })
  slug!: string;

  @Column("bigint", {
    comment: "The year the author was born, or their floruit, negative for BCE",
    nullable: true,
    transformer: BIGINT_NUMBER_TRANSFORMER,
  })
  @Index()
  startYear?: null | number;

  @OneToMany("Text", "author", { cascade: true })
  texts!: Text[];
}
