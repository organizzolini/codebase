import { describe, expect, it } from "vitest";

import { isIconName } from "./tag-icon.utilities";

describe(isIconName, () => {
  it("knows a lucide slug and not another name", () => {
    expect(isIconName("moon")).toBe(true);
    expect(isIconName("not-an-icon")).toBe(false);
  });
});
