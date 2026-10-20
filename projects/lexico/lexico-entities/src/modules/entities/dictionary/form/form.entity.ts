import { Entity, Index, ManyToOne, OneToMany, TableInheritance } from "typeorm";

import { DeletableEntity } from "@codebase/persistence";

import type { Lexeme } from "../lexeme.entity";
import type { WordForm } from "../word-form.entity";

/**
 * Base single-table-inheritance entity for all lexical forms.
 */
@Entity({
  comment:
    "Abstract base table for normalized inflected forms using single-table inheritance",
  name: "forms",
})
@TableInheritance({ column: { name: "type", type: "text" } })
export class Form extends DeletableEntity {
  @Index()
  @ManyToOne("Lexeme", "forms", {
    nullable: false,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  lexeme!: Lexeme;

  // Inverse side of WordForm.form
  @OneToMany("WordForm", "form")
  wordForms!: WordForm[];
}
