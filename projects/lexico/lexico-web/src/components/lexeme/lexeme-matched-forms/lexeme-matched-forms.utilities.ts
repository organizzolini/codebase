import {
  MAXIMUM_SHOWN_READINGS,
  READING_FIELDS,
} from "./lexeme-matched-forms.constants";

import type { LexemeFormRow } from "../lexeme-forms/lexeme-forms.types";
import type { MatchedForm } from "./lexeme-matched-forms.types";

// 🔏 Private Functions

/**
 * Folds readings beyond the maximum away, returning the matched forms that stay and the readings left out, each written as its form and values.
 */
export function collapseMatches(
  matches: readonly MatchedForm[],
  maximum: number = MAXIMUM_SHOWN_READINGS,
): { hidden: string[]; shown: MatchedForm[] } {
  let remaining = maximum;
  const hidden: string[] = [];
  const shown: MatchedForm[] = [];

  for (const { groups, text } of matches) {
    const kept = groups.slice(0, remaining);

    remaining -= kept.length;
    hidden.push(
      ...groups.slice(kept.length).map((group) => `${text} ${group.join(" ")}`),
    );
    if (kept.length > 0) {
      shown.push({ groups: kept, text });
    }
  }

  return { hidden, shown };
}

// 🌎 Public Functions

/**
 * Finds the written forms of a lexeme that a search matched, each with its distinct readings. A word matches ignoring case and accents, and the host of a word with a split-off enclitic matches too.
 */
export function matchForms(
  forms: readonly LexemeFormRow[],
  query: string,
  enclitic?: null | string,
): MatchedForm[] {
  const terms = new Set(
    normalize(query)
      .split(/\s+/u)
      .filter(Boolean)
      .flatMap((term) =>
        enclitic && term.endsWith(enclitic) && term !== enclitic
          ? [term, term.slice(0, -enclitic.length)]
          : [term],
      ),
  );
  const matches = new Map<string, Map<string, string[]>>();

  for (const form of forms) {
    if (!terms.has(normalize(form.word))) {
      continue;
    }
    const values = READING_FIELDS.flatMap((field) => form[field] ?? []);
    const readings = matches.get(form.word) ?? new Map<string, string[]>();

    readings.set(values.join(" "), values);
    matches.set(form.word, readings);
  }

  return [...matches].map(([text, readings]) => ({
    groups: [...readings.values()],
    text,
  }));
}

/**
 * Lowercases a word and drops its macrons and other accents.
 */
function normalize(word: string): string {
  return word.normalize("NFD").replaceAll(/\p{M}/gu, "").toLowerCase();
}
