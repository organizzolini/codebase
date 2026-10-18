import { ChildEntity, Column } from "typeorm";

import {
  adverbDegrees,
  adverbTypes,
} from "../../../lexico-database/lexico-database.constants";

import { Inflection } from "./Inflection.entity";

import type {
  AdverbDegree,
  AdverbType,
} from "../../../lexico-database/lexico-database.types";

/**
 * Inflection metadata for adverb lexemes.
 */
@ChildEntity("adverb")
export class AdverbInflection extends Inflection {
  @Column({
    comment: "Functional type of the adverb (descriptive or conjunctional)",
    default: "",
    enum: adverbTypes,
    type: "enum",
  })
  adverbType!: AdverbType;

  @Column({
    comment: "Degree of comparison (positive, comparative, superlative)",
    default: "positive",
    enum: adverbDegrees,
    type: "enum",
  })
  degree!: AdverbDegree;
}
