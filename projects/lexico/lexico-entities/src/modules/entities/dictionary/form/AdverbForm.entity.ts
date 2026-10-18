import { ChildEntity, Column } from "typeorm";

import { formDegreeValues } from "../../../lexico-database/lexico-database.constants";

import { Form } from "./Form.entity";

import type { FormDegree } from "../../../lexico-database/lexico-database.types";

/** An adverb form at a specific degree (positive, comparative, superlative). */
@ChildEntity("adverb")
export class AdverbForm extends Form {
  @Column({
    comment: "Degree of comparison (positive, comparative, superlative)",
    enum: formDegreeValues,
    type: "enum",
  })
  degree!: FormDegree;
}
