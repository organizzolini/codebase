import { describe, expect, it } from "vitest";

import { readNightSkyOverrides } from "./use-night-sky.utilities";

describe(readNightSkyOverrides, () => {
  it("reads the background colors with or without the #, as lowercase #rrggbb", () => {
    expect(
      readNightSkyOverrides({ "sky.bottom": "#ABC", "sky.top": "112233" }),
    ).toMatchObject({
      backgroundBottomColor: "#aabbcc",
      backgroundTopColor: "#112233",
    });
  });

  it("reads an all-digit color written with the #", () => {
    expect(readNightSkyOverrides({ "sky.top": "#123456" })).toMatchObject({
      backgroundTopColor: "#123456",
    });
  });

  it("falls back for a number, which the router makes of 1e5 and cannot give back", () => {
    for (const value of [123_456, 1e5, 100, 0]) {
      expect(readNightSkyOverrides({ "sky.top": value })).toMatchObject({
        backgroundTopColor: "#04060f",
      });
    }
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
