import { ChildEntity, Column } from "typeorm";

import { formGerundCaseValues } from "../../../database/database.constants";

import { Form } from "./form.entity";

import type { FormGerundCase } from "../../../database/database.types";

/** A verbal noun gerund form (genitive, dative, accusative, or ablative case). */
@ChildEntity("gerund")
export class GerundForm extends Form {
  @Column({
    comment:
      "Grammatical case of the gerund (genitive, dative, accusative, ablative)",
    enum: formGerundCaseValues,
    name: "form_case",
    type: "enum",
  })
  case!: FormGerundCase;
}
