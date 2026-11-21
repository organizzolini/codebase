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
export { AdjectivalForm } from "./modules/dictionary/modules/forms/adjectival-form.entity";
export { AdverbForm } from "./modules/dictionary/modules/forms/adverb-form.entity";
export { FiniteVerbForm } from "./modules/dictionary/modules/forms/finite-verb-form.entity";
export { Form } from "./modules/dictionary/modules/forms/form.entity";
export { GerundForm } from "./modules/dictionary/modules/forms/gerund-form.entity";
export { InfinitiveForm } from "./modules/dictionary/modules/forms/infinitive-form.entity";
export { NominalForm } from "./modules/dictionary/modules/forms/nominal-form.entity";
export { ParticipleForm } from "./modules/dictionary/modules/forms/participle-form.entity";
export { SupineForm } from "./modules/dictionary/modules/forms/supine-form.entity";
export { AdjectiveInflection } from "./modules/dictionary/modules/inflections/adjective-inflection.entity";
export { AdverbInflection } from "./modules/dictionary/modules/inflections/adverb-inflection.entity";
export { Inflection } from "./modules/dictionary/modules/inflections/inflection.entity";
export { NounInflection } from "./modules/dictionary/modules/inflections/noun-inflection.entity";
export { PrepositionInflection } from "./modules/dictionary/modules/inflections/preposition-inflection.entity";
export { UninflectedInflection } from "./modules/dictionary/modules/inflections/uninflected.entity";
export { VerbInflection } from "./modules/dictionary/modules/inflections/verb-inflection.entity";
export { Lexeme } from "./modules/dictionary/modules/lexemes/lexeme.entity";
export type { PartOfSpeech } from "./modules/dictionary/modules/lexemes/part-of-speech.entity";
export { partsOfSpeech as partOfSpeechEnumValues } from "./modules/dictionary/modules/lexemes/part-of-speech.entity";
export { PrincipalPart } from "./modules/dictionary/modules/lexemes/principal-part.entity";
export {
  Pronunciation,
  pronunciationVariants as pronunciationVariantValues,
} from "./modules/dictionary/modules/lexemes/pronunciation.entity";
export type { PronunciationVariant } from "./modules/dictionary/modules/lexemes/pronunciation.entity";
export { Translation } from "./modules/dictionary/modules/lexemes/translation.entity";
export { WordForm } from "./modules/dictionary/modules/words/word-form.entity";
export { WordLexeme } from "./modules/dictionary/modules/words/word-lexeme.entity";
export { Word } from "./modules/dictionary/modules/words/word.entity";
export {
  Author,
  type AuthorEra,
  authorEra,
  authorEras,
} from "./modules/literature/author.entity";
export { Line } from "./modules/literature/line.entity";
export {
  Text,
  type TextCollection,
  textCollection,
  textCollections,
} from "./modules/literature/text.entity";
export { Token } from "./modules/literature/token.entity";
export { InjectRepository, TypeOrmModule } from "@nestjs/typeorm";
export { DataSource, In, Repository } from "typeorm";
