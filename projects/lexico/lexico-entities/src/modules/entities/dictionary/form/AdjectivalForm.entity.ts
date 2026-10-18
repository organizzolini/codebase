import { ChildEntity, Column } from "typeorm";

import {
  formCaseValues,
  formGenderValues,
  formNumberValues,
} from "../../../database/database.constants";

import { Form } from "./Form.entity";

import type {
  FormCase,
  FormGender,
  FormNumber,
} from "../../../database/database.types";

/** A declined form for an adjective (gender + case + number). */
@ChildEntity("adjectival")
export class AdjectivalForm extends Form {
  @Column({
    comment: "Grammatical case of this form",
    enum: formCaseValues,
    name: "form_case",
    type: "enum",
  })
  case!: FormCase;

  @Column({
    comment: "Grammatical gender of this adjectival form",
    enum: formGenderValues,
    type: "enum",
  })
  gender!: FormGender;

  @Column({
    comment: "Grammatical number (singular or plural)",
    enum: formNumberValues,
    type: "enum",
  })
  number!: FormNumber;
}
