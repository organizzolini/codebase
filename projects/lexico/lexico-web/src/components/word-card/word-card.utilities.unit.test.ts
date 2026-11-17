import { describe, expect, it } from "vitest";

import { listReadings, summarizeLookup } from "./word-card.utilities";

import type { WordCandidate } from "./word-card.types";

const SAME: WordCandidate = {
  definition: "to be",
  description: "third person singular present",
  lemma: "sum",
  lexemeId: "lexeme-sum",
  partOfSpeech: "verb",
  translations: ["to be", "to exist"],
};

describe("word card utilities", () => {
  describe(listReadings, () => {
    it("gives every reading a distinct key, even when two share a lexeme and description", () => {
      const readings = listReadings([
        SAME,
        { ...SAME, definition: "to exist" },
      ]);
      const keys = readings.map((reading) => reading.key);

      expect(new Set(keys).size).toBe(2);
    });

    it("keeps each reading's position among the candidates", () => {
      const readings = listReadings([
        SAME,
        { ...SAME, definition: "to exist" },
      ]);

      expect(readings.map((reading) => reading.position)).toStrictEqual([0, 1]);
    });
  });

  describe(summarizeLookup, () => {
    it("names the lexeme of the one reading in view", () => {
      expect(summarizeLookup([SAME], false, null)).toStrictEqual({
        definition: "to be",
        form: "third person singular present",
        lexemeId: "lexeme-sum",
      });
    });

    it("names no lexeme while the reader has not chosen among readings", () => {
      expect(summarizeLookup([SAME, SAME], false, null).lexemeId).toBeNull();
    });

    it("names no lexeme when the word is not in the dictionary or the lookup failed", () => {
      expect(summarizeLookup([], false, null).lexemeId).toBeNull();
      expect(summarizeLookup(null, true, null).lexemeId).toBeNull();
    });
  });
});
