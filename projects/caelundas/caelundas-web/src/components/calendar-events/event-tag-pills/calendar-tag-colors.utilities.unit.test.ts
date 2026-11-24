import { describe, expect, it } from "vitest";

import { getTagColor } from "./calendar-tag-colors.utilities";

import type { CalendarEventTag } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";

const tag = (path: string): CalendarEventTag => ({
  depth: 0,
  id: path,
  name: path,
  path,
});

describe(getTagColor, () => {
  it("gives every tag beneath a root that root's color", () => {
    expect(getTagColor(tag("Aspect / Simple / Major"))).toBe(
      getTagColor(tag("Aspect")),
    );
  });

  it("gives different roots different colors", () => {
    expect(getTagColor(tag("Body / Mars"))).not.toBe(
      getTagColor(tag("Zodiac / Leo")),
    );
  });

  it("gives a root it does not know a color of its own", () => {
    expect(getTagColor(tag("Mystery / Thing"))).toMatch(/^#[0-9a-f]{6}$/);
  });
});
