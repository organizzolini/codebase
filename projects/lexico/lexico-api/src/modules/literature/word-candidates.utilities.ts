import {
  AdjectivalForm,
  AdverbForm,
  FiniteVerbForm,
  type Form,
  GerundForm,
  InfinitiveForm,
  NominalForm,
  ParticipleForm,
  SupineForm,
  type WordForm,
} from "@codebase/lexico-db";

import { WordCandidateType } from "./word-candidate.entities";

/**
 * Describes a form the way a grammar book words it, such as "ablative
 * singular" or "present indicative active third singular".
 */
export function describeForm(form: Form): string {
  if (form instanceof NominalForm) {
    return `${form.case} ${form.number}`;
  }
  if (form instanceof AdjectivalForm) {
    return `${form.gender} ${form.case} ${form.number}`;
  }
  if (form instanceof FiniteVerbForm) {
    return `${form.tense} ${form.mood} ${form.voice} ${form.person} ${form.number}`;
  }
  return describeVerbalForm(form);
}

/**
 * Maps the word-form links of one word to candidates, one per link, each with
 * its lexeme's headword, part of speech, and first translation.
 */
export function toWordCandidates(
  wordForms: readonly WordForm[],
): WordCandidateType[] {
  return wordForms.map(({ form }) =>
    Object.assign(new WordCandidateType(), {
      definition: form.lexeme.translations?.[0]?.data ?? null,
      description: describeForm(form),
      lemma: form.lexeme.lemma,
      lexemeId: form.lexeme.id,
      partOfSpeech: form.lexeme.partOfSpeech,
      translations: (form.lexeme.translations ?? []).map(({ data }) => data),
    }),
  );
}

/** Describes the non-finite verb forms, gerunds, supines, and adverbs. */
function describeVerbalForm(form: Form): string {
  if (form instanceof ParticipleForm) {
    return `${form.tense} ${form.voice} participle`;
  }
  if (form instanceof InfinitiveForm) {
    return `${form.tense} ${form.voice} infinitive`;
  }
  if (form instanceof GerundForm) {
    return `${form.case} gerund`;
  }
  if (form instanceof SupineForm) {
    return `${form.case} supine`;
  }
  if (form instanceof AdverbForm) {
    return `${form.degree} adverb`;
  }
  throw new Error(`Cannot describe a ${form.constructor.name}`);
}
