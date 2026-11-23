/* cspell:words operaque */

import { describe, expect, it } from "vitest";

import { collapseMatches, matchForms } from "./lexeme-matched-forms.utilities";

import type { LexemeFormRow } from "../lexeme-forms/lexeme-forms.types";

const nominal = (
  word: string,
  case_: string,
  number = "singular",
): LexemeFormRow => ({
  case: case_,
  id: `${word}-${case_}-${number}`,
  kind: "NominalForm",
  number,
  word,
});
const opus = [
  nominal("opus", "nominative"),
  nominal("opus", "vocative"),
  nominal("opus", "accusative"),
  nominal("opera", "nominative", "plural"),
];
const amo: LexemeFormRow = {
  id: "1",
  kind: "FiniteVerbForm",
  mood: "indicative",
  number: "singular",
  person: "first",
  tense: "present",
  voice: "active",
  word: "amō",
};

describe("matched forms", () => {
  describe(matchForms, () => {
    it("groups the readings of one matched word, in grammar-book order", () => {
      expect(matchForms([amo, ...opus], "amo")).toStrictEqual([
        {
          groups: [["indicative", "active", "present", "singular", "first"]],
          text: "amō",
        },
      ]);
      expect(matchForms(opus, "Opus")).toStrictEqual([
        {
          groups: [
            ["nominative", "singular"],
            ["vocative", "singular"],
            ["accusative", "singular"],
          ],
          text: "opus",
        },
      ]);
    });

    it("matches the host of a word with an enclitic, and each word of a query", () => {
      expect(
        matchForms(opus, "operaque opus", "que").map((m) => m.text),
      ).toStrictEqual(["opus", "opera"]);
      expect(matchForms(opus, "que", "que")).toStrictEqual([]);
    });

    it("finds nothing when no form is spelled like the query", () => {
      expect(matchForms(opus, "work")).toStrictEqual([]);
    });
  });

  describe(collapseMatches, () => {
    const matches = matchForms(opus, "opus opera");

    it("keeps every reading under the maximum", () => {
      expect(collapseMatches(matches, 9)).toStrictEqual({
        hidden: [],
        shown: matches,
      });
    });

    it("names the readings left out", () => {
      const { hidden, shown } = collapseMatches(matches, 3);

      expect(shown.map((match) => match.groups.length)).toStrictEqual([3]);
      expect(hidden).toStrictEqual(["opera nominative plural"]);
    });
  });
});
