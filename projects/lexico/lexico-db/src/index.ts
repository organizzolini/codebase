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
export { Lexeme } from "./modules/dictionary/entities/lexeme.entity";
export type { PartOfSpeech } from "./modules/dictionary/entities/part-of-speech.entity";
export { partsOfSpeech as partOfSpeechEnumValues } from "./modules/dictionary/entities/part-of-speech.entity";
export { PrincipalPart } from "./modules/dictionary/entities/principal-part.entity";
export {
  Pronunciation,
  pronunciationVariants as pronunciationVariantValues,
} from "./modules/dictionary/entities/pronunciation.entity";
export type { PronunciationVariant } from "./modules/dictionary/entities/pronunciation.entity";
export { Translation } from "./modules/dictionary/entities/translation.entity";
export { WordForm } from "./modules/dictionary/entities/word-form.entity";
export { WordLexeme } from "./modules/dictionary/entities/word-lexeme.entity";
export { Word } from "./modules/dictionary/entities/word.entity";
export { AdjectivalForm } from "./modules/dictionary/modules/forms/entities/adjectival-form.entity";
export { AdverbForm } from "./modules/dictionary/modules/forms/entities/adverb-form.entity";
export { FiniteVerbForm } from "./modules/dictionary/modules/forms/entities/finite-verb-form.entity";
export { Form } from "./modules/dictionary/modules/forms/entities/form.entity";
export { GerundForm } from "./modules/dictionary/modules/forms/entities/gerund-form.entity";
export { InfinitiveForm } from "./modules/dictionary/modules/forms/entities/infinitive-form.entity";
export { NominalForm } from "./modules/dictionary/modules/forms/entities/nominal-form.entity";
export { ParticipleForm } from "./modules/dictionary/modules/forms/entities/participle-form.entity";
export { SupineForm } from "./modules/dictionary/modules/forms/entities/supine-form.entity";
export { AdjectiveInflection } from "./modules/dictionary/modules/inflections/entities/adjective-inflection.entity";
export { AdverbInflection } from "./modules/dictionary/modules/inflections/entities/adverb-inflection.entity";
export { Inflection } from "./modules/dictionary/modules/inflections/entities/inflection.entity";
export { NounInflection } from "./modules/dictionary/modules/inflections/entities/noun-inflection.entity";
export { PrepositionInflection } from "./modules/dictionary/modules/inflections/entities/preposition-inflection.entity";
export { UninflectedInflection } from "./modules/dictionary/modules/inflections/entities/uninflected.entity";
export { VerbInflection } from "./modules/dictionary/modules/inflections/entities/verb-inflection.entity";
export { Author } from "./modules/literature/entities/author.entity";
export { Line } from "./modules/literature/entities/line.entity";
export { Text } from "./modules/literature/entities/text.entity";
export { Token } from "./modules/literature/entities/token.entity";
export { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
export { DataSource, In, Repository } from "typeorm";
