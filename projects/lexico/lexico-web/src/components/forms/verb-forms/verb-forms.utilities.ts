import {
  FINITE_KIND,
  MOODS,
  NON_FINITE_HEADINGS,
  NON_FINITE_TAB,
  NON_FINITE_TENSES,
  TENSES,
  VERBAL_NOUN_CASES,
  VERBAL_NOUN_KINDS,
  VOICES,
} from "./verb-forms.constants";

import type {
  Conjugation,
  NonFiniteSection,
  Selection,
  TableKeys,
  VerbFormRow,
} from "./verb-forms.types";

// 🔏 Private Functions

/**
 * Narrows a conjugation by the chosen voice, mood, and tense, falling back to the first option the rows still offer.
 */
export function narrow(rows: VerbFormRow[], selection: Selection): Conjugation {
  const finite = rows.filter((row) => row.kind === FINITE_KIND);
  const hasNonFinite = finite.length < rows.length;
  const voices = [
    ...VOICES.filter((voice) => finite.some((row) => row.voice === voice)),
    ...(hasNonFinite ? [NON_FINITE_TAB] : []),
  ];
  const voice = pick(voices, selection.voice);
  const voiceRows = finite.filter((row) => row.voice === voice);
  const moods = MOODS.filter((mood) =>
    voiceRows.some((row) => row.mood === mood),
  );
  const mood = pick(moods, selection.mood);
  const moodRows = voiceRows.filter((row) => row.mood === mood);
  const tenses = TENSES.filter((tense) =>
    moodRows.some((row) => row.tense === tense),
  );
  const tense = pick(tenses, selection.tense);

  return {
    mood,
    moods,
    tense,
    tenseRows: moodRows.filter((row) => row.tense === tense),
    tenses,
    voice,
    voices,
  };
}

// 🌎 Public Functions

/**
 * Groups the forms without a person into tables: infinitives and participles by
 * tense and voice, gerund and supine by case.
 */
export function nonFiniteSections(rows: VerbFormRow[]): NonFiniteSection[] {
  const ofKind = (...kinds: string[]): VerbFormRow[] =>
    rows.filter((row) => kinds.includes(row.kind));
  const byTense = {
    column: (form: VerbFormRow) => form.voice,
    columns: VOICES,
    row: (form: VerbFormRow) => form.tense,
    rows: NON_FINITE_TENSES,
  };

  return [
    tabulate(NON_FINITE_HEADINGS.infinitive, ofKind("InfinitiveForm"), byTense),
    tabulate(NON_FINITE_HEADINGS.participle, ofKind("ParticipleForm"), byTense),
    tabulate(
      NON_FINITE_HEADINGS.verbalNoun,
      ofKind(...Object.keys(VERBAL_NOUN_KINDS)),
      {
        column: (form) => VERBAL_NOUN_KINDS[form.kind],
        columns: Object.values(VERBAL_NOUN_KINDS),
        row: (form) => form.case,
        rows: VERBAL_NOUN_CASES,
      },
    ),
  ].filter((section) => section !== undefined);
}

/**
 * Keeps the selected option when the options still offer it, and otherwise
 * falls back to the first.
 */
function pick(options: string[], selected: string): string | undefined {
  return options.includes(selected) ? selected : options[0];
}

/**
 * Tables forms by a row key and a column key, keeping the keys the forms use,
 * or nothing when no form is left.
 */
function tabulate(
  label: string,
  forms: VerbFormRow[],
  keys: TableKeys,
): NonFiniteSection | undefined {
  const axis = (order: string[], of: typeof keys.row): string[] =>
    order.filter((key) => forms.some((form) => of(form) === key));
  const columns = axis(keys.columns, keys.column);
  const rows = axis(keys.rows, keys.row);

  return forms.length === 0
    ? undefined
    : {
        columns: columns.map((key) => ({ key, label: key })),
        label,
        lookup: (row, column) => [
          ...new Set(
            forms
              .filter(
                (form) =>
                  keys.row(form) === row && keys.column(form) === column,
              )
              .map((form) => form.word),
          ),
        ],
        rows: rows.map((key) => ({ key, label: key })),
      };
}
