import { describe, expect, it } from "vitest";

import { getNameTint } from "./table-name-cell.utilities";

describe(getNameTint, () => {
  it("mixes the color into the background", () => {
    expect(getNameTint("#b91c1c")).toStrictEqual({
      background: "color-mix(in oklab, #b91c1c 20%, hsl(var(--background)))",
    });
  });

  it("gives no tint to an event with no color", () => {
    expect(getNameTint(null)).toBeUndefined();
  });
});
