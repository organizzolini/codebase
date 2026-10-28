import {
  DECLINED_PARTS_OF_SPEECH,
  NOMINAL_PARTS_OF_SPEECH,
} from "./lexeme-header.constants";

import type { LexemeInflection } from "./lexeme-header.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * An adverb's type and degree.
 */
export function describeAdverb(
  inflection: LexemeInflection,
): (null | string | undefined)[] {
  return [inflection.adverbType, inflection.degree];
}

/**
 * An adjective's declension and degree.
 */
export function describeDeclined(
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
export function describeInflection(
  partOfSpeech: string,
  inflection: LexemeInflection | null | undefined,
): string[] {
  if (inflection === null || inflection === undefined) {
    return [];
  }

  const describe = findDescriber(partOfSpeech);

  return describe(inflection).filter(
    (detail): detail is string =>
      detail !== null && detail !== undefined && detail !== "",
  );
}

/**
 * A noun's declension and gender.
 */
export function describeNoun(
  inflection: LexemeInflection,
): (null | string | undefined)[] {
  return [
    inflection.declension ? `${inflection.declension} declension` : "",
    inflection.gender,
  ];
}

/**
 * The case a preposition takes.
 */
export function describePreposition(
  inflection: LexemeInflection,
): (null | string | undefined)[] {
  return [inflection.case ? `with ${inflection.case}` : ""];
}

/**
 * A verb's conjugation and whatever the entry notes about it. The note, such
 * as "fourth, deponent", repeats the conjugation and then adds what is
 * notable about the verb.
 */
export function describeVerb(
  inflection: LexemeInflection,
): (null | string | undefined)[] {
  const [, ...notes] = (inflection.other ?? "").split(", ");

  return [
    inflection.conjugation ? `${inflection.conjugation} conjugation` : "",
    ...notes,
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
 * How to describe the inflection of a part of speech, or its plain details
 * when it has no inflection of its own.
 */
function findDescriber(
  partOfSpeech: string,
): (inflection: LexemeInflection) => (null | string | undefined)[] {
  if (DECLINED_PARTS_OF_SPEECH.has(partOfSpeech)) {
    return describeDeclined;
  }

  if (NOMINAL_PARTS_OF_SPEECH.has(partOfSpeech)) {
    return describeNoun;
  }

  switch (partOfSpeech) {
    case "adverb": {
      return describeAdverb;
    }
    case "preposition": {
      return describePreposition;
    }
    case "verb": {
      return describeVerb;
    }
    default: {
      return describeOther;
    }
  }
}
