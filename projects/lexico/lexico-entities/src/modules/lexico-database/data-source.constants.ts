import "reflect-metadata";

import { createDataSource } from "@codebase/database";

import { AdjectivalForm } from "../entities/dictionary/form/adjectival-form.entity";
import { AdverbForm } from "../entities/dictionary/form/adverb-form.entity";
import { FiniteVerbForm } from "../entities/dictionary/form/finite-verb-form.entity";
import { Form } from "../entities/dictionary/form/form.entity";
import { GerundForm } from "../entities/dictionary/form/gerund-form.entity";
import { InfinitiveForm } from "../entities/dictionary/form/infinitive-form.entity";
import { NominalForm } from "../entities/dictionary/form/nominal-form.entity";
import { ParticipleForm } from "../entities/dictionary/form/participle-form.entity";
import { SupineForm } from "../entities/dictionary/form/supine-form.entity";
import { AdjectiveInflection } from "../entities/dictionary/inflection/adjective-inflection.entity";
import { AdverbInflection } from "../entities/dictionary/inflection/adverb-inflection.entity";
import { Inflection } from "../entities/dictionary/inflection/inflection.entity";
import { NounInflection } from "../entities/dictionary/inflection/noun-inflection.entity";
import { PrepositionInflection } from "../entities/dictionary/inflection/preposition-inflection.entity";
import { UninflectedInflection } from "../entities/dictionary/inflection/uninflected.entity";
import { VerbInflection } from "../entities/dictionary/inflection/verb-inflection.entity";
import { Lexeme } from "../entities/dictionary/lexeme.entity";
import { PrincipalPart } from "../entities/dictionary/principal-part.entity";
import { Pronunciation } from "../entities/dictionary/pronunciation.entity";
import { Translation } from "../entities/dictionary/translation.entity";
import { WordForm } from "../entities/dictionary/word-form.entity";
import { WordLexeme } from "../entities/dictionary/word-lexeme.entity";
import { Word } from "../entities/dictionary/word.entity";
import { Author } from "../entities/literature/author.entity";
import { Line } from "../entities/literature/line.entity";
import { Text } from "../entities/literature/text.entity";
import { Token } from "../entities/literature/token.entity";

import { LexicoNamingStrategy } from "./lexico-database.constants";
import { Migration1791164926316 } from "./migrations/1791164926316-migration";

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
export const LEXICO_DATABASE_MIGRATIONS = [Migration1791164926316] as const;

/**
 * The data source the TypeORM command line reads for
 * `nx run lexico-entities:migration:*`, built from the same options as the
 * runtime `LexicoDatabaseModule`. Reads only `LEXICO_POSTGRES_*`, defaulting to
 * `lexico_development`.`lexico` as `lexico_username`, and never synchronizes.
 */
export const lexicoDataSource = createDataSource({
  entities: [...LEXICO_DATABASE_ENTITIES],
  migrations: ["src/modules/lexico-database/migrations/*.ts"],
  namingStrategy: new LexicoNamingStrategy(),
  project: "lexico",
});
