import { describe, expect, it } from "vitest";

import { getEventLabel } from "./calendar-glyphs";

import type { CalendarEventRecord } from "../events-database/events-database.types";

function event(summary: string, description = ""): CalendarEventRecord {
  return {
    color: null,
    description,
    durationMinutes: 0,
    end: new Date("2026-03-01T00:00:00Z"),
    groups: [],
    id: summary,
    location: null,
    start: new Date("2026-03-01T00:00:00Z"),
    summary,
    tags: [],
    timezone: "UTC",
  };
}

describe(getEventLabel, () => {
  it("splits the symbols from the name by the description, which repeats it", () => {
    expect(
      getEventLabel(
        event(
          "🎯 🌙 ⚹ ♆ Moon perfective sextile Neptune",
          "Moon perfective sextile Neptune",
        ),
      ),
    ).toStrictEqual({
      details: undefined,
      glyphs: "🌙 ⚹ ♆",
      name: "Moon perfective sextile Neptune",
    });
  });

  it("splits at the first word of English when there is no description", () => {
    expect(getEventLabel(event("☀️ ⏬ Solar Nadir"))).toStrictEqual({
      details: undefined,
      glyphs: "☀️ ⏬",
      name: "Solar Nadir",
    });
    expect(getEventLabel(event("🌠 Astronomical Dawn"))).toMatchObject({
      glyphs: "🌠",
      name: "Astronomical Dawn",
    });
  });

  it("reads a one-letter symbol as a symbol and not as a word", () => {
    expect(
      getEventLabel(event("⬅️ 🌙 U ♄ Moon dissolving undecile Saturn")),
    ).toMatchObject({
      glyphs: "⬅️ 🌙 U ♄",
      name: "Moon dissolving undecile Saturn",
    });
    expect(
      getEventLabel(event("🎯 ☀️ N ♇ Sun perfective novile Pluto")),
    ).toMatchObject({ glyphs: "☀️ N ♇" });
  });

  it("keeps symbols that run together with no space between them", () => {
    expect(getEventLabel(event("♂️±⚴ Mars biquintile Pallas"))).toMatchObject({
      glyphs: "♂️±⚴",
      name: "Mars biquintile Pallas",
    });
  });

  it("says what the database adds to the name", () => {
    expect(
      getEventLabel(
        event(
          "Mars Conjunct Venus",
          "Mars and Venus meet at the same zodiacal longitude",
        ),
      ).details,
    ).toBe("Mars and Venus meet at the same zodiacal longitude");
  });

  it("draws an event with no symbols by its whole name", () => {
    expect(getEventLabel(event("Mars Retrograde"))).toStrictEqual({
      details: undefined,
      glyphs: "Mars Retrograde",
      name: "Mars Retrograde",
    });
  });

  it("leaves a stand-in for a cluster as it is", () => {
    expect(
      getEventLabel({
        ...event("11 specialty aspects", "11 events run together here."),
        id: "cluster:event-a",
      }),
    ).toStrictEqual({
      details: undefined,
      glyphs: "11 specialty aspects",
      name: "11 specialty aspects",
    });
  });

  it("reads an event of nothing but symbols as all name", () => {
    expect(getEventLabel(event("🌠"))).toMatchObject({
      glyphs: "🌠",
      name: "🌠",
    });
  });

  it("leaves out the mark of an aspect that is exact, which an instant says", () => {
    expect(
      getEventLabel(event("🎯 🌙 ⚹ ♆ Moon perfective sextile Neptune")),
    ).toMatchObject({
      glyphs: "🌙 ⚹ ♆",
      name: "Moon perfective sextile Neptune",
    });
  });
});
