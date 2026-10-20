export { LEXICO_DATABASE_MIGRATIONS } from "./modules/database/data-source.constants";
export {
  adjectiveDeclensionValues,
  adjectiveDegreeValues,
  adverbDegrees as adverbDegreeValues,
  adverbTypes as adverbFunctionTypeValues,
  formCaseValues,
  formDegreeValues,
  formGenderValues,
  formGerundCaseValues,
  formMoodValues,
  formNonFiniteTenseValues,
  formNumberValues,
  formPersonValues,
  formSupineCaseValues,
  formTenseValues,
  formVoiceValues,
  inflectionDeclensionValues,
  nounDeclensionValues,
  nounGenders,
  prepositionCases,
  verbConjugationValues,
} from "./modules/database/database.constants";
export { LexicoNamingStrategy } from "./modules/database/database.constants";
export {
  DatabaseModule,
  DatabaseModule as LexicoDatabaseModule,
} from "./modules/database/database.module";
export {
  DatabaseService,
  DatabaseService as LexicoDatabaseService,
} from "./modules/database/database.service";
export type {
  AdjectiveDeclension,
  AdjectiveDegree,
  AdverbDegree,
  AdverbType as AdverbFunctionType,
  FormCase,
  FormDegree,
  FormGender,
  FormGerundCase,
  FormMood,
  FormNonFiniteTense,
  FormNumber,
  FormPerson,
  FormSupineCase,
  FormTense,
  FormVoice,
  NounDeclension,
  NounGender,
  PrepositionCase,
  VerbConjugation,
} from "./modules/database/database.types";
export { AdjectivalForm } from "./modules/entities/dictionary/form/adjectival-form.entity";
export { AdverbForm } from "./modules/entities/dictionary/form/adverb-form.entity";
export { FiniteVerbForm } from "./modules/entities/dictionary/form/finite-verb-form.entity";
export { Form } from "./modules/entities/dictionary/form/form.entity";
export { GerundForm } from "./modules/entities/dictionary/form/gerund-form.entity";
export { InfinitiveForm } from "./modules/entities/dictionary/form/infinitive-form.entity";
export { NominalForm } from "./modules/entities/dictionary/form/nominal-form.entity";
export { ParticipleForm } from "./modules/entities/dictionary/form/participle-form.entity";
export { SupineForm } from "./modules/entities/dictionary/form/supine-form.entity";
export { AdjectiveInflection } from "./modules/entities/dictionary/inflection/adjective-inflection.entity";
export { AdverbInflection } from "./modules/entities/dictionary/inflection/adverb-inflection.entity";
export { Inflection } from "./modules/entities/dictionary/inflection/inflection.entity";
export { NounInflection } from "./modules/entities/dictionary/inflection/noun-inflection.entity";
export { PrepositionInflection } from "./modules/entities/dictionary/inflection/preposition-inflection.entity";
export { UninflectedInflection } from "./modules/entities/dictionary/inflection/uninflected.entity";
export { VerbInflection } from "./modules/entities/dictionary/inflection/verb-inflection.entity";
export { Lexeme } from "./modules/entities/dictionary/lexeme.entity";
export type { PartOfSpeech } from "./modules/entities/dictionary/part-of-speech.entity";
export { partsOfSpeech as partOfSpeechEnumValues } from "./modules/entities/dictionary/part-of-speech.entity";
export { PrincipalPart } from "./modules/entities/dictionary/principal-part.entity";
export {
  Pronunciation,
  pronunciationVariants as pronunciationVariantValues,
} from "./modules/entities/dictionary/pronunciation.entity";
export type { PronunciationVariant } from "./modules/entities/dictionary/pronunciation.entity";
export { Translation } from "./modules/entities/dictionary/translation.entity";
export { Word } from "./modules/entities/dictionary/word.entity";
export { WordForm } from "./modules/entities/dictionary/word-form.entity";
export { WordLexeme } from "./modules/entities/dictionary/word-lexeme.entity";
export { EntitiesModule } from "./modules/entities/entities.module";
export { Author } from "./modules/entities/literature/author.entity";
export { Line } from "./modules/entities/literature/line.entity";
export { Text } from "./modules/entities/literature/text.entity";
export { Token } from "./modules/entities/literature/token.entity";
export { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
export { DataSource, In, Repository } from "typeorm";
