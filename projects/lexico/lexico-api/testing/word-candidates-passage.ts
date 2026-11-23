/* cspell:words canō */

import {
  FiniteVerbForm,
  Lexeme,
  NominalForm,
  Translation,
  Word,
  WordForm,
} from "@codebase/lexico-db";

import type { DataSource } from "typeorm";

/**
 * Links the passage's words to their lexemes and forms. "arma" surfaces as two
 * forms of one noun, so it has two candidates; "cano" as one verb form.
 */
export async function seedWordCandidates(
  dataSource: DataSource,
): Promise<void> {
  const arma = await seedLexeme(dataSource, {
    forms: [
      createNominalForm("nominative", "plural"),
      createNominalForm("accusative", "plural"),
    ],
    lemma: "arma",
    meaning: "arms",
    partOfSpeech: "noun",
  });
  const cano = await seedLexeme(dataSource, {
    forms: [createFirstPersonSingular()],
    lemma: "canō",
    meaning: "to sing",
    partOfSpeech: "verb",
  });

  await linkWord(dataSource, "arma", arma);
  await linkWord(dataSource, "cano", cano);
}

/** Builds the first-person singular present indicative active form. */
function createFirstPersonSingular(): FiniteVerbForm {
  const form = new FiniteVerbForm();
  form.mood = "indicative";
  form.number = "singular";
  form.person = "first";
  form.tense = "present";
  form.voice = "active";
  return form;
}

/** Builds a nominal form for the given case and number. */
function createNominalForm(
  case_: NominalForm["case"],
  number: NominalForm["number"],
): NominalForm {
  const form = new NominalForm();
  form.case = case_;
  form.number = number;
  return form;
}

/** Links a passage word to each form of a lexeme. */
async function linkWord(
  dataSource: DataSource,
  data: string,
  lexeme: Lexeme,
): Promise<void> {
  const word = await dataSource.getRepository(Word).findOneByOrFail({ data });
  await dataSource.getRepository(WordForm).save(
    lexeme.forms.map((form) => {
      const wordForm = new WordForm();
      wordForm.form = form;
      wordForm.word = word;
      return wordForm;
    }),
  );
}

/** Saves a lexeme with its forms and one translation. */
async function seedLexeme(
  dataSource: DataSource,
  seed: {
    readonly forms: (FiniteVerbForm | NominalForm)[];
    readonly lemma: string;
    readonly meaning: string;
    readonly partOfSpeech: Lexeme["partOfSpeech"];
  },
): Promise<Lexeme> {
  const lexeme = new Lexeme();
  lexeme.lemma = seed.lemma;
  lexeme.partOfSpeech = seed.partOfSpeech;
  lexeme.forms = seed.forms;
  lexeme.translations = [new Translation(seed.meaning, lexeme)];
  return dataSource.getRepository(Lexeme).save(lexeme);
}
