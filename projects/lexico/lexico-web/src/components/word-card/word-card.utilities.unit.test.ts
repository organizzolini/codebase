import { describe, expect, it } from "vitest";

import { listReadings } from "./word-card.utilities";

import type { WordCandidate } from "./word-card.types";

const SAME: WordCandidate = {
  definition: "to be",
  description: "third person singular present",
  lemma: "sum",
  lexemeId: "lexeme-sum",
  partOfSpeech: "verb",
};

describe(listReadings, () => {
  it("gives every reading a distinct key, even when two share a lexeme and description", () => {
    const readings = listReadings([SAME, { ...SAME, definition: "to exist" }]);
    const keys = readings.map((reading) => reading.key);

    expect(new Set(keys).size).toBe(2);
  });

  it("keeps each reading's position among the candidates", () => {
    const readings = listReadings([SAME, { ...SAME, definition: "to exist" }]);

    expect(readings.map((reading) => reading.position)).toStrictEqual([0, 1]);
  });
});
