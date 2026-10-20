import { ChildEntity, Column } from "typeorm";

import {
  formNonFiniteTenseValues,
  formVoiceValues,
} from "../../../database/database.constants";

import { Form } from "./form.entity";

import type {
  FormNonFiniteTense,
  FormVoice,
} from "../../../database/database.types";

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
