import { describe, expect, it } from "vitest";

import { getCardGlyphs } from "./calendar-event-card.utilities";

describe(getCardGlyphs, () => {
  it("gives the event's symbols when it has some", () => {
    expect(
      getCardGlyphs(undefined, {
        details: undefined,
        glyphs: "♂️☌♀️",
        name: "Mars Conjunct Venus",
      }),
    ).toBe("♂️☌♀️");
  });

  it("gives none for an event drawn by its name alone", () => {
    expect(
      getCardGlyphs(undefined, {
        details: undefined,
        glyphs: "Plain",
        name: "Plain",
      }),
    ).toBeUndefined();
  });

  it("gives none for a marker that stands for several events", () => {
    expect(
      getCardGlyphs(
        { name: "3 events" },
        { details: undefined, glyphs: "♂️", name: "Mars" },
      ),
    ).toBeUndefined();
  });
});
