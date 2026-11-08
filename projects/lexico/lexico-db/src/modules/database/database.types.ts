import type {
  adjectiveDeclension,
  adjectiveDegree,
  adverbDegree,
  adverbType,
  formCase,
  formDegree,
  formGender,
  formGerundCase,
  formMood,
  formNonFiniteTense,
  formNumber,
  formPerson,
  formSupineCase,
  formTense,
  formVoice,
  nounDeclension,
  nounGender,
  prepositionCase,
  verbConjugation,
} from "./database.constants";

// 🏷️ Types
/** Declension class of a Latin adjective (first/second or third). */
export type AdjectiveDeclension =
  (typeof adjectiveDeclension)[keyof typeof adjectiveDeclension];

/** Degree of comparison of a Latin adjective. */
export type AdjectiveDegree =
  (typeof adjectiveDegree)[keyof typeof adjectiveDegree];

/** Degree of comparison of a Latin adverb. */
export type AdverbDegree = (typeof adverbDegree)[keyof typeof adverbDegree];

/**
 * Functional classification of a Latin adverb.
 * Descriptive adverbs modify a verb or adjective; conjunctional adverbs link clauses.
 */
export type AdverbType = (typeof adverbType)[keyof typeof adverbType];

/** Grammatical case of a Latin inflected form. */
export type FormCase = (typeof formCase)[keyof typeof formCase];

/** Degree of comparison of a Latin adjective or adverb form. */
export type FormDegree = (typeof formDegree)[keyof typeof formDegree];

/** Grammatical gender of a Latin inflected form. */
export type FormGender = (typeof formGender)[keyof typeof formGender];

/**
 * Grammatical case of a Latin gerund.
 * Gerunds only appear in the four oblique cases — nominative and vocative are excluded.
 */
export type FormGerundCase =
  (typeof formGerundCase)[keyof typeof formGerundCase];

/** Mood of a finite Latin verb form. */
export type FormMood = (typeof formMood)[keyof typeof formMood];

/**
 * Temporal aspect of a non-finite verb form (infinitives, participles, gerunds, supines).
 * Restricted to future, perfect, and present — unlike the fuller tense set available to finite forms.
 */
export type FormNonFiniteTense =
  (typeof formNonFiniteTense)[keyof typeof formNonFiniteTense];

/** Grammatical number of an inflected Latin form. */
export type FormNumber = (typeof formNumber)[keyof typeof formNumber];

/** Grammatical person of a finite Latin verb form. */
export type FormPerson = (typeof formPerson)[keyof typeof formPerson];

/**
 * Case of a Latin supine form.
 * Supines occur only in the accusative (to express purpose) and ablative (to express respect).
 */
export type FormSupineCase =
  (typeof formSupineCase)[keyof typeof formSupineCase];

/** Tense of a finite Latin verb form. */
export type FormTense = (typeof formTense)[keyof typeof formTense];

/** Voice of a Latin verb form. */
export type FormVoice = (typeof formVoice)[keyof typeof formVoice];

/** Declension class of a Latin noun, which determines its inflectional endings. */
export type NounDeclension =
  (typeof nounDeclension)[keyof typeof nounDeclension];

/** Grammatical gender of a Latin noun, including `masc/fem` for nouns whose gender varies by referent. */
export type NounGender = (typeof nounGender)[keyof typeof nounGender];

/** Grammatical case governed by a Latin preposition. */
export type PrepositionCase =
  (typeof prepositionCase)[keyof typeof prepositionCase];

/** Conjugation class of a Latin verb, which determines its inflectional stem and personal endings. */
export type VerbConjugation =
  (typeof verbConjugation)[keyof typeof verbConjugation];
