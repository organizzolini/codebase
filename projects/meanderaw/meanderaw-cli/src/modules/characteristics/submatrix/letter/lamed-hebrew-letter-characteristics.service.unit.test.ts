import { beforeAll, describe, expect, it } from "vitest";

import { expectedCounts, letterHarness } from "../../../../../testing/letters";

import { LamedHebrewLetterCharacteristicsService } from "./lamed-hebrew-letter-characteristics.service";
import { LETTER_ORIENTATION_NAMES } from "./letter.constants";

import type { LetterOrientationFixture } from "../../../../../testing/letters";

/** One isolated Code per orientation of the ל (Hebrew lamed). */
const ORIENTATIONS: readonly LetterOrientationFixture[] = [
  {
    fixture: "03x03y040690800",
    names: ["Southeast", "SoutheastHalf", "Northwest", "NorthwestHalf"],
  },
  {
    fixture: "04x02y25000a10",
    names: [
      "SoutheastQuarter",
      "SoutheastThreeQuarter",
      "NorthwestQuarter",
      "NorthwestThreeQuarter",
    ],
  },
  {
    fixture: "03x03y400a50080",
    names: ["Southwest", "SouthwestHalf", "Northeast", "NortheastHalf"],
  },
  {
    fixture: "04x02y06102900",
    names: [
      "SouthwestQuarter",
      "SouthwestThreeQuarter",
      "NortheastQuarter",
      "NortheastThreeQuarter",
    ],
  },
];

describe(LamedHebrewLetterCharacteristicsService, () => {
  const letter = letterHarness(LamedHebrewLetterCharacteristicsService);

  beforeAll(async () => {
    await letter.compile();
  });

  it("keys all sixteen orientations", () => {
    expect(letter.keys()).toStrictEqual(
      LETTER_ORIENTATION_NAMES.map((name) => `lamed${name}HebrewCount`),
    );
  });

  it("draws every orientation name in exactly one fixture", () => {
    expect(ORIENTATIONS.flatMap(({ names }) => names).toSorted()).toStrictEqual(
      LETTER_ORIENTATION_NAMES.toSorted(),
    );
  });

  it.each(ORIENTATIONS)(
    "counts $fixture once under each of $names and under no other name",
    ({ fixture, names }) => {
      expect(letter.counts(fixture)).toStrictEqual(expectedCounts(names));
    },
  );

  it.each(ORIENTATIONS)(
    "sizes the window of each of $names to the ink of $fixture",
    ({ fixture, names }) => {
      expect(letter.windows(names)).toStrictEqual(
        names.map(() => letter.inkedWindow(fixture)),
      );
    },
  );
});
