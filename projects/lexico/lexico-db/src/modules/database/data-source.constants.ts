import "reflect-metadata";

import { createDataSource } from "@codebase/persistence";

import { Migration1791164926316 } from "../../../migrations/1791164926316-migration";
import { Migration1792000000000 } from "../../../migrations/1792000000000-migration";
import { AdjectivalForm } from "../dictionary/modules/forms/adjectival-form.entity";
import { AdverbForm } from "../dictionary/modules/forms/adverb-form.entity";
import { FiniteVerbForm } from "../dictionary/modules/forms/finite-verb-form.entity";
import { Form } from "../dictionary/modules/forms/form.entity";
import { GerundForm } from "../dictionary/modules/forms/gerund-form.entity";
import { InfinitiveForm } from "../dictionary/modules/forms/infinitive-form.entity";
import { NominalForm } from "../dictionary/modules/forms/nominal-form.entity";
import { ParticipleForm } from "../dictionary/modules/forms/participle-form.entity";
import { SupineForm } from "../dictionary/modules/forms/supine-form.entity";
import { AdjectiveInflection } from "../dictionary/modules/inflections/adjective-inflection.entity";
import { AdverbInflection } from "../dictionary/modules/inflections/adverb-inflection.entity";
import { Inflection } from "../dictionary/modules/inflections/inflection.entity";
import { NounInflection } from "../dictionary/modules/inflections/noun-inflection.entity";
import { PrepositionInflection } from "../dictionary/modules/inflections/preposition-inflection.entity";
import { UninflectedInflection } from "../dictionary/modules/inflections/uninflected.entity";
import { VerbInflection } from "../dictionary/modules/inflections/verb-inflection.entity";
import { Lexeme } from "../dictionary/modules/lexemes/lexeme.entity";
import { PrincipalPart } from "../dictionary/modules/lexemes/principal-part.entity";
import { Pronunciation } from "../dictionary/modules/lexemes/pronunciation.entity";
import { Translation } from "../dictionary/modules/lexemes/translation.entity";
import { WordForm } from "../dictionary/modules/words/word-form.entity";
import { WordLexeme } from "../dictionary/modules/words/word-lexeme.entity";
import { Word } from "../dictionary/modules/words/word.entity";
import { Author } from "../literature/author.entity";
import { Line } from "../literature/line.entity";
import { Text } from "../literature/text.entity";
import { Token } from "../literature/token.entity";

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
  migrations: ["migrations/*.ts"],
  project: "lexico",
});
