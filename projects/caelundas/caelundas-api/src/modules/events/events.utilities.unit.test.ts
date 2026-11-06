import { describe, expect, it } from "vitest";

import { toIsoString } from "./events.utilities";

describe(toIsoString, () => {
  it("writes a date as ISO 8601 text in UTC", () => {
    expect(toIsoString(new Date("2026-03-05T03:30:00Z"))).toBe(
      "2026-03-05T03:30:00.000Z",
    );
  });

  it("normalizes a string the scalar left as text", () => {
    expect(toIsoString("2026-03-05T03:30:00-05:00")).toBe(
      "2026-03-05T08:30:00.000Z",
    );
  });
});
