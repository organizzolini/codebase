import { ChildEntity, Column } from "typeorm";

import { formDegreeValues } from "../../../database/database.constants";

import { Form } from "./form.entity";

import type { FormDegree } from "../../../database/database.types";

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
