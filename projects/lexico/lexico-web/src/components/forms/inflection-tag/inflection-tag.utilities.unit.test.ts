import { describe, expect, it } from "vitest";

import { describeTag } from "./inflection-tag.utilities";

describe(describeTag, () => {
  it("colors values of one category alike and of another differently", () => {
    expect(describeTag("indicative").variant).toBe(
      describeTag("subjunctive").variant,
    );
    expect(describeTag("indicative").variant).not.toBe(
      describeTag("present").variant,
    );
  });

  it("outlines a value it does not know", () => {
    expect(describeTag("gerund").variant).toBe("outline");
  });
});
