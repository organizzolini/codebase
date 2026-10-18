import { ChildEntity, Column } from "typeorm";

import { formSupineCaseValues } from "../../../lexico-database/lexico-database.constants";

import { Form } from "./Form.entity";

import type { FormSupineCase } from "../../../lexico-database/lexico-database.types";

/** A verbal noun supine form (accusative or ablative case). */
@ChildEntity("supine")
export class SupineForm extends Form {
  @Column({
    comment: "Grammatical case of the supine (accusative or ablative)",
    enum: formSupineCaseValues,
    name: "form_case",
    type: "enum",
  })
  case!: FormSupineCase;
}
