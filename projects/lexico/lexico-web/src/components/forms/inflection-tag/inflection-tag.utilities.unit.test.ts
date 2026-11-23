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
    expect(describeTag("unlisted").variant).toBe("outline");
  });

  it("turns a category's light badge solid when selected", () => {
    expect(describeTag("present").variant).toBe("warning-light");
    expect(describeTag("present", true).variant).toBe("warning");
  });
});
