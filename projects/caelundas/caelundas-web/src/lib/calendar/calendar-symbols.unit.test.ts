import { describe, expect, it } from "vitest";

import { parseCalendarSymbols } from "./calendar-symbols";

describe(parseCalendarSymbols, () => {
  it("reads emojis from a link", () => {
    expect(parseCalendarSymbols("emojis")).toBe("emojis");
  });

  it("falls back to the default for anything else", () => {
    expect(parseCalendarSymbols("glyphs")).toBeUndefined();
    expect(parseCalendarSymbols(3)).toBeUndefined();
    expect(parseCalendarSymbols(undefined)).toBeUndefined();
  });
});
