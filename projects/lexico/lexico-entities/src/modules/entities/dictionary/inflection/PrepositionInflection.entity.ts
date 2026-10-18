import { ChildEntity, Column } from "typeorm";

import { prepositionCases } from "../../../lexico-database/lexico-database.constants";

import { Inflection } from "./Inflection.entity";

import type { PrepositionCase } from "../../../lexico-database/lexico-database.types";

/**
 * Inflection metadata for preposition lexemes.
 */
@ChildEntity("preposition")
export class PrepositionInflection extends Inflection {
  @Column({
    comment:
      "Grammatical case governed by the preposition (accusative or ablative)",
    default: "",
    enum: prepositionCases,
    type: "enum",
  })
  case!: PrepositionCase;

  @Column("text", {
    comment: "Additional inflection notes",
    nullable: true,
  })
  other?: string;
}
