import { describe, expect, it } from "vitest";

import {
  AdjectivalForm,
  AdverbForm,
  FiniteVerbForm,
  Form,
  GerundForm,
  InfinitiveForm,
  Lexeme,
  NominalForm,
  ParticipleForm,
  SupineForm,
  Translation,
  WordForm,
} from "@codebase/lexico-db";

import { describeForm, toWordCandidates } from "./word-candidates.utilities";

/** Builds a lexeme with one translation, its forms attached. */
function lexeme(lemma: string, data: null | string): Lexeme {
  const entry = new Lexeme();
  entry.id = `${lemma}-id`;
  entry.lemma = lemma;
  entry.partOfSpeech = "noun";
  entry.translations = data === null ? [] : [new Translation(data, entry)];
  return entry;
}

/** Links a form to its lexeme and a word, as a word-form row. */
function link(form: NominalForm, entry: Lexeme): WordForm {
  form.lexeme = entry;
  const wordForm = new WordForm();
  wordForm.form = form;
  return wordForm;
}

/** Builds a nominal form for the given case and number. */
function nominal(
  case_: NominalForm["case"],
  number: NominalForm["number"],
): NominalForm {
  const form = new NominalForm();
  form.case = case_;
  form.number = number;
  return form;
}

describe("word candidate utilities", () => {
  describe(describeForm, () => {
    it("describes a nominal form by case and number", () => {
      expect(describeForm(nominal("ablative", "singular"))).toBe(
        "ablative singular",
      );
    });

    it("describes a finite verb form by tense, mood, voice, person, and number", () => {
      const form = new FiniteVerbForm();
      form.tense = "present";
      form.mood = "indicative";
      form.voice = "active";
      form.person = "first";
      form.number = "singular";

      expect(describeForm(form)).toBe(
        "present indicative active first singular",
      );
    });
  });

  describe("the other form kinds", () => {
    it.each([
      [
        "an adjectival form",
        Object.assign(new AdjectivalForm(), {
          case: "genitive",
          gender: "feminine",
          number: "plural",
        }),
        "feminine genitive plural",
      ],
      [
        "a participle",
        Object.assign(new ParticipleForm(), {
          tense: "perfect",
          voice: "passive",
        }),
        "perfect passive participle",
      ],
      [
        "an infinitive",
        Object.assign(new InfinitiveForm(), {
          tense: "present",
          voice: "active",
        }),
        "present active infinitive",
      ],
      [
        "a gerund",
        Object.assign(new GerundForm(), { case: "dative" }),
        "dative gerund",
      ],
      [
        "a supine",
        Object.assign(new SupineForm(), { case: "accusative" }),
        "accusative supine",
      ],
      [
        "an adverb",
        Object.assign(new AdverbForm(), { degree: "comparative" }),
        "comparative adverb",
      ],
    ])("describes %s", (_, form, description) => {
      expect(describeForm(form)).toBe(description);
    });

    it("refuses a form of an unknown kind rather than describing it as nothing", () => {
      expect(() => describeForm(new Form())).toThrow("Cannot describe a Form");
    });
  });

  describe(toWordCandidates, () => {
    it("maps each word-form link to a candidate with its lexeme and first translation", () => {
      const arma = lexeme("arma", "arms");
      const candidates = toWordCandidates([
        link(nominal("nominative", "plural"), arma),
        link(nominal("accusative", "plural"), arma),
      ]);

      expect(candidates).toMatchObject([
        {
          definition: "arms",
          description: "nominative plural",
          lemma: "arma",
          lexemeId: "arma-id",
          partOfSpeech: "noun",
        },
        {
          definition: "arms",
          description: "accusative plural",
          lemma: "arma",
          lexemeId: "arma-id",
          partOfSpeech: "noun",
        },
      ]);
    });

    it("lists every translation of the lexeme, in stored order", () => {
      const arma = lexeme("arma", "arms");
      arma.translations?.push(new Translation("weapons", arma));

      const candidates = toWordCandidates([
        link(nominal("nominative", "plural"), arma),
      ]);

      expect(candidates[0]?.translations).toStrictEqual(["arms", "weapons"]);
    });

    it("returns a null definition when the lexeme has no translation", () => {
      const candidates = toWordCandidates([
        link(nominal("genitive", "singular"), lexeme("rosa", null)),
      ]);

      expect(candidates[0]?.definition).toBeNull();
      expect(candidates[0]?.translations).toStrictEqual([]);
    });

    it("returns no candidates for no word-form links", () => {
      expect(toWordCandidates([])).toStrictEqual([]);
    });
  });
});
