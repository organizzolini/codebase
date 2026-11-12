import { Entity, Index, ManyToOne } from "typeorm";

import { PostgresqlDeletableEntity } from "@codebase/persistence";

import { Form } from "./form/form.entity";

import type { Word } from "./word.entity";
import type { Relation } from "typeorm";

/**
 * Junction linking a normalized Latin word string to a morphological form.
 *
 * Replaces an implicit TypeORM join table so the row carries audit columns and a stable UUID.
 *
 * Deleting a Form cascades to its WordForm rows.
 */
@Entity({
  comment:
    "Junction table linking a normalized Latin word string to the morphological forms it can surface as",
  name: "word_forms",
})
@Index(["word", "form"], { unique: true })
export class WordForm extends PostgresqlDeletableEntity {
  /** The morphological form side of the junction. Cascade-deletes with the Form. */
  @Index()
  @ManyToOne("Form", "wordForms", {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  form!: Relation<Form>;

  /** The word string side of the junction. */
  @Index()
  @ManyToOne("Word", "wordForms", {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  word!: Relation<Word>;
}
