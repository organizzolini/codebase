import { CardDescription, CardHeader, CardTitle } from "@codebase/interface";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties LexemeHeader accepts.
 */
export interface LexemeHeaderProperties {
  className?: string;
  inflection?: LexemeInflection | null | undefined;
  lemma: string;
  partOfSpeech: string;
  principalParts: string[];
}

/**
 * The inflection of a lexeme as the API reports it. Which fields are filled
 * depends on the part of speech: a noun has a declension and gender, a verb a
 * conjugation, and so on.
 */
export interface LexemeInflection {
  adverbType?: null | string;
  case?: null | string;
  conjugation?: null | string;
  declension?: null | string;
  degree?: null | string;
  gender?: null | string;
  other?: null | string;
}

// 🧩 Component

/**
 * The top of a lexeme card: its principal parts, or its lemma when none were
 * ingested, over its part of speech and inflection, such as "noun, first
 * declension, feminine".
 */
export function LexemeHeader(
  properties: Readonly<LexemeHeaderProperties>,
): ReactNode {
  const { className, inflection, lemma, partOfSpeech, principalParts } =
    properties;

  // 🪝 Hooks

  // 🏗 Setup
  const title = principalParts.length === 0 ? lemma : principalParts.join(", ");
  // The API names parts of speech in camel case, such as `properNoun`.
  const partOfSpeechWords = partOfSpeech
    .replaceAll(/([A-Z])/gu, " $1")
    .toLowerCase();
  const details = [
    partOfSpeechWords,
    ...describeInflection(partOfSpeech, inflection),
  ];

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="lexeme-header"
    >
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{details.join(", ")}</CardDescription>
      </CardHeader>
    </div>
  );
}

// 🔏 Private Functions

/**
 * An adverb's type and degree.
 */
function describeAdverb(
  inflection: LexemeInflection,
): (null | string | undefined)[] {
  return [inflection.adverbType, inflection.degree];
}

/**
 * An adjective's declension and degree.
 */
function describeDeclined(
  inflection: LexemeInflection,
): (null | string | undefined)[] {
  return [
    inflection.declension ? `${inflection.declension} declension` : "",
    inflection.degree,
  ];
}

/**
 * What an inflection says about a lexeme, as the fields its part of speech
 * fills, with the empty ones left out.
 */
function describeInflection(
  partOfSpeech: string,
  inflection: LexemeInflection | null | undefined,
): string[] {
  if (inflection === null || inflection === undefined) {
    return [];
  }

  const describe = DESCRIBERS[partOfSpeech] ?? describeOther;

  return describe(inflection).filter(
    (detail): detail is string =>
      detail !== null && detail !== undefined && detail !== "",
  );
}

/**
 * A noun's declension and gender.
 */
function describeNoun(
  inflection: LexemeInflection,
): (null | string | undefined)[] {
  return [
    inflection.declension ? `${inflection.declension} declension` : "",
    inflection.gender,
  ];
}

/**
 * What the entry notes about a part of speech that has no inflection of its
 * own.
 */
function describeOther(
  inflection: LexemeInflection,
): (null | string | undefined)[] {
  return [inflection.other];
}

/**
 * The case a preposition takes.
 */
function describePreposition(
  inflection: LexemeInflection,
): (null | string | undefined)[] {
  return [inflection.case ? `with ${inflection.case}` : ""];
}

/**
 * A verb's conjugation and whatever the entry notes about it. The note, such
 * as "fourth, deponent", repeats the conjugation and then adds what is
 * notable about the verb.
 */
function describeVerb(
  inflection: LexemeInflection,
): (null | string | undefined)[] {
  const [, ...notes] = (inflection.other ?? "").split(", ");

  return [
    inflection.conjugation ? `${inflection.conjugation} conjugation` : "",
    ...notes,
  ];
}

/**
 * How to describe the inflection of each part of speech that has one.
 */
const DESCRIBERS: Readonly<
  Record<
    string,
    (inflection: LexemeInflection) => (null | string | undefined)[]
  >
> = {
  adjective: describeDeclined,
  adverb: describeAdverb,
  noun: describeNoun,
  numeral: describeDeclined,
  participle: describeDeclined,
  preposition: describePreposition,
  properNoun: describeNoun,
  suffix: describeDeclined,
  verb: describeVerb,
};
