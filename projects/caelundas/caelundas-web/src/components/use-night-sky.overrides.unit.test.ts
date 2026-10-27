import { describe, expect, it } from "vitest";

import { readNightSkyOverrides } from "./use-night-sky.overrides";

describe(readNightSkyOverrides, () => {
  it("reads the background colors with or without the #, as lowercase #rrggbb", () => {
    expect(
      readNightSkyOverrides({ "sky.bottom": "#ABC", "sky.top": "112233" }),
    ).toMatchObject({
      backgroundBottomColor: "#aabbcc",
      backgroundTopColor: "#112233",
    });
  });

  it("reads a color the router turned into a number", () => {
    expect(readNightSkyOverrides({ "sky.top": 123_456 })).toMatchObject({
      backgroundTopColor: "#123456",
    });
  });

  it("falls back to the default colors for anything that is not hexadecimal", () => {
    for (const value of [
      "red",
      "12345",
      "#12345g",
      'red"/><script>',
      "#fff;x",
      "",
      true,
      null,
      [1],
    ]) {
      expect(
        readNightSkyOverrides({ "sky.bottom": value, "sky.top": value }),
      ).toMatchObject({
        backgroundBottomColor: "#0d1533",
        backgroundTopColor: "#04060f",
      });
    }
  });
});
