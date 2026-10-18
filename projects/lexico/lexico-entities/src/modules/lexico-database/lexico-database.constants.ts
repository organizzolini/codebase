import pluralize from "pluralize";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

// ♟️ Constants
export const formCase = {
  ablative: "ablative",
  accusative: "accusative",
  dative: "dative",
  genitive: "genitive",
  locative: "locative",
  nominative: "nominative",
  vocative: "vocative",
} as const;

/** Grammatical case of a Latin inflected form. */
export const formCaseValues = Object.values(formCase);

export const formNumber = {
  plural: "plural",
  singular: "singular",
} as const;

/** Grammatical number of an inflected Latin form. */
export const formNumberValues = Object.values(formNumber);

export const formGender = {
  feminine: "feminine",
  masculine: "masculine",
  neuter: "neuter",
} as const;

/** Grammatical gender of an inflected Latin form. */
export const formGenderValues = Object.values(formGender);

export const formMood = {
  imperative: "imperative",
  indicative: "indicative",
  subjunctive: "subjunctive",
} as const;

/** Mood of a finite Latin verb form. */
export const formMoodValues = Object.values(formMood);

export const formVoice = {
  active: "active",
  passive: "passive",
} as const;

/** Voice of a Latin verb form. */
export const formVoiceValues = Object.values(formVoice);

export const formTense = {
  future: "future",
  futurePerfect: "futurePerfect",
  imperfect: "imperfect",
  perfect: "perfect",
  pluperfect: "pluperfect",
  present: "present",
} as const;

/** Tense of a finite Latin verb form. */
export const formTenseValues = Object.values(formTense);

export const formPerson = {
  first: "first",
  second: "second",
  third: "third",
} as const;

/** Grammatical person of a finite Latin verb form. */
export const formPersonValues = Object.values(formPerson);

export const formDegree = {
  comparative: "comparative",
  positive: "positive",
  superlative: "superlative",
} as const;

/** Degree of comparison of a Latin adjective or adverb form. */
export const formDegreeValues = Object.values(formDegree);

export const formNonFiniteTense = {
  future: "future",
  perfect: "perfect",
  present: "present",
} as const;

/**
 * Temporal aspect of a non-finite verb form (infinitives, participles, gerunds, supines).
 * Restricted to future, perfect, and present — unlike the fuller tense set available to finite forms.
 */

export const formNonFiniteTenseValues = Object.values(formNonFiniteTense);

export const formGerundCase = {
  ablative: "ablative",
  accusative: "accusative",
  dative: "dative",
  genitive: "genitive",
} as const;

/**
 * Grammatical case of a Latin gerund.
 * Gerunds only appear in the four oblique cases — nominative and vocative are excluded.
 */

export const formGerundCaseValues = Object.values(formGerundCase);

export const formSupineCase = {
  ablative: "ablative",
  accusative: "accusative",
} as const;

/**
 * Case of a Latin supine form.
 * Supines occur only in the accusative (to express purpose) and ablative (to express respect).
 */

export const formSupineCaseValues = Object.values(formSupineCase);

export const nounDeclension = {
  fifth: "fifth",
  first: "first",
  fourth: "fourth",
  none: "",
  second: "second",
  third: "third",
} as const;

/** Declension class of a Latin noun, which determines its inflectional endings. */

export const nounDeclensionValues = Object.values(nounDeclension);

export const adjectiveDeclension = {
  firstSecond: "first/second",
  none: "",
  third: "third",
} as const;

/** Declension class of a Latin adjective (first/second or third). */

export const adjectiveDeclensionValues = Object.values(adjectiveDeclension);

export const inflectionDeclension = {
  ...nounDeclension,
  ...adjectiveDeclension,
} as const;

export const inflectionDeclensionValues = Object.values(inflectionDeclension);

export const nounGender = {
  feminine: "feminine",
  mascFem: "masc/fem",
  masculine: "masculine",
  neuter: "neuter",
  none: "",
} as const;

/** Grammatical gender of a Latin noun, including `masc/fem` for nouns whose gender varies by referent. */
export const nounGenders = Object.values(nounGender);

export const adjectiveDegree = {
  comparative: "comparative",
  positive: "positive",
  superlative: "superlative",
} as const;

/** Degree of comparison of a Latin adjective. */

export const adjectiveDegreeValues = Object.values(adjectiveDegree);

export const adverbType = {
  conjunctional: "conjunctional",
  descriptive: "descriptive",
  none: "",
} as const;

/**
 * Functional classification of a Latin adverb.
 * Descriptive adverbs modify a verb or adjective; conjunctional adverbs link clauses.
 */
export const adverbTypes = Object.values(adverbType);

export const adverbDegree = {
  comparative: "comparative",
  positive: "positive",
  superlative: "superlative",
} as const;

/** Degree of comparison of a Latin adverb. */
export const adverbDegrees = Object.values(adverbDegree);

export const verbConjugation = {
  first: "first",
  fourth: "fourth",
  none: "",
  second: "second",
  third: "third",
  thirdIo: "third-io",
} as const;

/** Conjugation class of a Latin verb, which determines its inflectional stem and personal endings. */

export const verbConjugationValues = Object.values(verbConjugation);

export const prepositionCase = {
  ablative: "ablative",
  accusative: "accusative",
  none: "",
} as const;

/** Grammatical case governed by a Latin preposition. */

export const prepositionCases = Object.values(prepositionCase);

/**
 * Custom TypeORM naming strategy that extends SnakeNamingStrategy with:
 * - Automatic pluralization of table names
 * - Join table names formed from the two table names combined alphabetically in snake_case.
 */
export const LexicoNamingStrategy: new () => SnakeNamingStrategy = class extends SnakeNamingStrategy {
  /**
   * Builds a deterministic join table name from both entity table names.
   */
  override joinTableName(
    firstEntityName: string,
    secondEntityName: string,
  ): string {
    const firstTableName = super.tableName(firstEntityName, firstEntityName);
    const secondTableName = super.tableName(secondEntityName, secondEntityName);
    const sortedPluralizedTableNames = [
      pluralize(firstTableName),
      pluralize(secondTableName),
    ].toSorted();
    const joinTableName = sortedPluralizedTableNames.join("_");
    return joinTableName;
  }

  /**
   * Converts a base table name to the pluralized table name used in the schema.
   */
  override tableName(targetName: string, userSpecifiedName: string): string {
    const baseTableName = super.tableName(targetName, userSpecifiedName);
    const tableName = pluralize(baseTableName);
    return tableName;
  }
};
