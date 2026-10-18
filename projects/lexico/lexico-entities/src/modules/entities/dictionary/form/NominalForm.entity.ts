import { ChildEntity, Column } from "typeorm";

import {
  formCaseValues,
  formNumberValues,
} from "../../../lexico-database/lexico-database.constants";

import { Form } from "./Form.entity";

import type {
  FormCase,
  FormNumber,
} from "../../../lexico-database/lexico-database.types";

/** A declined form for a noun, pronoun, or determiner (case + number). */
@ChildEntity("nominal")
export class NominalForm extends Form {
  @Column({
    comment: "Grammatical case of this form",
    enum: formCaseValues,
    name: "form_case",
    type: "enum",
  })
  case!: FormCase;

  @Column({
    comment: "Grammatical number (singular or plural)",
    enum: formNumberValues,
    type: "enum",
  })
  number!: FormNumber;
}
