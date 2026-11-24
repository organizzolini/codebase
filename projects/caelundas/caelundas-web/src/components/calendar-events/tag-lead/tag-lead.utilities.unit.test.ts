import { describe, expect, it } from "vitest";

import { getLeadMode } from "./tag-lead.utilities";

describe(getLeadMode, () => {
  it("draws an icon as an icon under either setting", () => {
    expect(getLeadMode({ kind: "icon", value: "tag" }, "glyphs")).toBe("icon");
    expect(getLeadMode({ kind: "icon", value: "tag" }, "emojis")).toBe("icon");
  });

  it("draws a symbol as an icon under the glyphs setting and as text under emojis", () => {
    expect(getLeadMode({ kind: "glyph", value: "♀" }, "glyphs")).toBe("glyphs");
    expect(getLeadMode({ kind: "glyph", value: "♀" }, "emojis")).toBe("emoji");
  });
});
