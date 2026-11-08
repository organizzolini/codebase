import "reflect-metadata";

import { createDataSource } from "@codebase/persistence";

import { AdjectivalForm } from "../dictionary/entities/form/adjectival-form.entity";
import { AdverbForm } from "../dictionary/entities/form/adverb-form.entity";
import { FiniteVerbForm } from "../dictionary/entities/form/finite-verb-form.entity";
import { Form } from "../dictionary/entities/form/form.entity";
import { GerundForm } from "../dictionary/entities/form/gerund-form.entity";
import { InfinitiveForm } from "../dictionary/entities/form/infinitive-form.entity";
import { NominalForm } from "../dictionary/entities/form/nominal-form.entity";
import { ParticipleForm } from "../dictionary/entities/form/participle-form.entity";
import { SupineForm } from "../dictionary/entities/form/supine-form.entity";
import { AdjectiveInflection } from "../dictionary/entities/inflection/adjective-inflection.entity";
import { AdverbInflection } from "../dictionary/entities/inflection/adverb-inflection.entity";
import { Inflection } from "../dictionary/entities/inflection/inflection.entity";
import { NounInflection } from "../dictionary/entities/inflection/noun-inflection.entity";
import { PrepositionInflection } from "../dictionary/entities/inflection/preposition-inflection.entity";
import { UninflectedInflection } from "../dictionary/entities/inflection/uninflected.entity";
import { VerbInflection } from "../dictionary/entities/inflection/verb-inflection.entity";
import { Lexeme } from "../dictionary/entities/lexeme.entity";
import { PrincipalPart } from "../dictionary/entities/principal-part.entity";
import { Pronunciation } from "../dictionary/entities/pronunciation.entity";
import { Translation } from "../dictionary/entities/translation.entity";
import { WordForm } from "../dictionary/entities/word-form.entity";
import { WordLexeme } from "../dictionary/entities/word-lexeme.entity";
import { Word } from "../dictionary/entities/word.entity";
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

/** Every migration, in order, for the test harness; the runtime module runs none. */
export const LEXICO_DATABASE_MIGRATIONS = [
  Migration1791164926316,
  Migration1792000000000,
] as const;

/**
 * The data source the TypeORM command line reads for
 * `nx run lexico-db:migration:*`, built from the same options as the
 * runtime `DatabaseModule`. Reads only `LEXICO_POSTGRES_*`, defaulting to
 * `lexico_development`.`lexico` as `lexico_username`, and never synchronizes.
 */
export const lexicoDataSource = createDataSource({
  entities: [...LEXICO_DATABASE_ENTITIES],
  migrations: ["src/modules/database/migrations/*.ts"],
  project: "lexico",
});
