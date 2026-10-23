import { describe, expect, it } from "vitest";

import { detectorFamiliesFor } from "./reference-families.utilities";

import type { ReferenceFixture } from "./reference-fixtures.types";

function fixtureWith(
  summaries: string[],
  extra: Partial<ReferenceFixture> = {},
): ReferenceFixture {
  return {
    events: summaries.map((summary) => ({
      start: "2026-03-20T10:37:00Z",
      summary,
    })),
    name: "a sample fixture",
    retrieved: "2026-10-07",
    source: { name: "Sample Authority", url: "https://example.test/almanac" },
    toleranceMinutes: 2,
    window: {
      endDate: "2026-03-21",
      latitude: 39.949_309,
      longitude: -75.171_69,
      startDate: "2026-03-20",
    },
    ...extra,
  };
}

describe(detectorFamiliesFor, () => {
  it("names the family each expected summary belongs to", () => {
    expect.hasAssertions();

    const families = detectorFamiliesFor(
      fixtureWith([
        "🌄 Civil Dawn",
        "☀️🔼 Sunrise",
        "📍☀️🐉 Partial Solar Eclipse",
      ]),
    );

    expect([...families].toSorted()).toStrictEqual([
      "dailyCycles",
      "eclipses",
      "twilights",
    ]);
  });

  it("reads forbidden and counted summaries too", () => {
    expect.hasAssertions();

    const families = detectorFamiliesFor(
      fixtureWith(["♀️🔆 Venus Eastern Brightest"], {
        absent: ["🎯☿☌♀️ Mercury perfective conjunct Venus"],
        counts: { "☀️→♈ Sun ingress Aries": 1 },
      }),
    );

    expect([...families].toSorted()).toStrictEqual([
      "aspects",
      "ingresses",
      "phases",
    ]);
  });

  it("refuses a summary no family claims", () => {
    expect.hasAssertions();

    expect(() =>
      detectorFamiliesFor(fixtureWith(["🪐 Something new"])),
    ).toThrow('No detector family is known for "🪐 Something new"');
  });
});
