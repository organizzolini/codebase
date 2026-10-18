import { ChildEntity, Column } from "typeorm";

import {
  formNonFiniteTenseValues,
  formVoiceValues,
} from "../../../lexico-database/lexico-database.constants";

import { Form } from "./Form.entity";

import type {
  FormNonFiniteTense,
  FormVoice,
} from "../../../lexico-database/lexico-database.types";

/** A non-finite infinitive form (voice + tense). */
@ChildEntity("infinitive")
export class InfinitiveForm extends Form {
  @Column({
    comment: "Tense of the infinitive (present, perfect, future)",
    enum: formNonFiniteTenseValues,
    type: "enum",
  })
  tense!: FormNonFiniteTense;

  @Column({
    comment: "Grammatical voice (active or passive)",
    enum: formVoiceValues,
    type: "enum",
  })
  voice!: FormVoice;
}
