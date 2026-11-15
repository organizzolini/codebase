import "reflect-metadata";

import { createDataSource } from "@codebase/persistence";

import { Lexeme } from "../dictionary/entities/lexeme.entity";
import { PrincipalPart } from "../dictionary/entities/principal-part.entity";
import { Pronunciation } from "../dictionary/entities/pronunciation.entity";
import { Translation } from "../dictionary/entities/translation.entity";
import { WordForm } from "../dictionary/entities/word-form.entity";
import { WordLexeme } from "../dictionary/entities/word-lexeme.entity";
import { Word } from "../dictionary/entities/word.entity";
import { AdjectivalForm } from "../dictionary/modules/forms/entities/adjectival-form.entity";
import { AdverbForm } from "../dictionary/modules/forms/entities/adverb-form.entity";
import { FiniteVerbForm } from "../dictionary/modules/forms/entities/finite-verb-form.entity";
import { Form } from "../dictionary/modules/forms/entities/form.entity";
import { GerundForm } from "../dictionary/modules/forms/entities/gerund-form.entity";
import { InfinitiveForm } from "../dictionary/modules/forms/entities/infinitive-form.entity";
import { NominalForm } from "../dictionary/modules/forms/entities/nominal-form.entity";
import { ParticipleForm } from "../dictionary/modules/forms/entities/participle-form.entity";
import { SupineForm } from "../dictionary/modules/forms/entities/supine-form.entity";
import { AdjectiveInflection } from "../dictionary/modules/inflections/entities/adjective-inflection.entity";
import { AdverbInflection } from "../dictionary/modules/inflections/entities/adverb-inflection.entity";
import { Inflection } from "../dictionary/modules/inflections/entities/inflection.entity";
import { NounInflection } from "../dictionary/modules/inflections/entities/noun-inflection.entity";
import { PrepositionInflection } from "../dictionary/modules/inflections/entities/preposition-inflection.entity";
import { UninflectedInflection } from "../dictionary/modules/inflections/entities/uninflected.entity";
import { VerbInflection } from "../dictionary/modules/inflections/entities/verb-inflection.entity";
import { Author } from "../literature/entities/author.entity";
import { Line } from "../literature/entities/line.entity";
import { Text } from "../literature/entities/text.entity";
import { Token } from "../literature/entities/token.entity";

import { Migration1791164926316 } from "./migrations/1791164926316-migration";
import { Migration1792000000000 } from "./migrations/1792000000000-migration";

export const LEXICO_DATABASE_ENTITIES = [
  Lexeme,
  Inflection,
  NounInflection,
  VerbInflection,
  AdjectiveInflection,
  AdverbInflection,
  PrepositionInflection,
  UninflectedInflection,
  PrincipalPart,
  Pronunciation,
  Word,
  Translation,
  Form,
  NominalForm,
  AdjectivalForm,
  AdverbForm,
  FiniteVerbForm,
  InfinitiveForm,
  ParticipleForm,
  GerundForm,
  SupineForm,
  WordForm,
  WordLexeme,
  Author,
  Text,
  Line,
  Token,
] as const;

/** Every migration, for the test harness; the runtime runs none. */
export const LEXICO_DATABASE_MIGRATIONS = [
  Migration1791164926316,
  Migration1792000000000,
] as const;

/** TypeORM migration source: reads `LEXICO_POSTGRES_*`, never synchronizes. */
export const lexicoDataSource = createDataSource({
  entities: [...LEXICO_DATABASE_ENTITIES],
  migrations: ["src/modules/database/migrations/*.ts"],
  project: "lexico",
});
