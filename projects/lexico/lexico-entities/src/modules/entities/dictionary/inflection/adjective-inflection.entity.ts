import { ChildEntity, Column } from "typeorm";

import {
  adjectiveDegreeValues,
  inflectionDeclensionValues,
} from "../../../database/database.constants";

import { Inflection } from "./inflection.entity";

import type {
  AdjectiveDeclension,
  AdjectiveDegree,
} from "../../../database/database.types";

/**
 * Inflection metadata for adjective lexemes.
 */
@ChildEntity("adjective")
export class AdjectiveInflection extends Inflection {
  @Column({
    comment: "Adjective declension class (first/second or third)",
    default: "",
    enum: inflectionDeclensionValues,
    type: "enum",
  })
  declension!: AdjectiveDeclension;

  @Column({
    comment: "Degree of comparison (positive, comparative, superlative)",
    default: "positive",
    enum: adjectiveDegreeValues,
    type: "enum",
  })
  degree!: AdjectiveDegree;
}
