import {
  FINITE_KIND,
  MOODS,
  NON_FINITE_TAB,
  TENSES,
  VOICES,
} from "./verb-forms.constants";

import type { Conjugation, Selection, VerbFormRow } from "./verb-forms.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Narrows a conjugation down by the voice, mood and tense chosen. Each choice
 * holds only while the rows above it still have it, and otherwise falls back to
 * the first the rows do have.
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

/**
 * Keeps the selected option when the options still offer it, and otherwise
 * falls back to the first.
 */
function pick(options: string[], selected: string): string | undefined {
  return options.includes(selected) ? selected : options[0];
}
