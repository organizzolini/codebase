import { describe, expect, it } from "vitest";

import { getTagColor } from "./calendar-tag-colors.utilities";

import type { CalendarEventTag } from "../types/events-database.types";

const tag = (path: string): CalendarEventTag => ({
  depth: 0,
  id: path,
  name: path,
  path,
});

describe(getTagColor, () => {
  it("gives every tag beneath a root that root's color", () => {
    expect(getTagColor(tag("Type / Aspect / Major Aspect"))).toBe(
      getTagColor(tag("Type")),
    );
  });

  it("gives different roots different colors", () => {
    expect(getTagColor(tag("Planet / Mars"))).not.toBe(
      getTagColor(tag("Sign / Leo")),
    );
  });

  it("gives a root it does not know a color of its own", () => {
    expect(getTagColor(tag("Mystery / Thing"))).toMatch(/^#[0-9a-f]{6}$/);
  });
});
