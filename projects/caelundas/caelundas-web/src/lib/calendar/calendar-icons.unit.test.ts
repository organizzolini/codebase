import { describe, expect, it } from "vitest";

import { toGlyphParts } from "./calendar-icons";

function files(glyphs: string): string[] {
  return toGlyphParts(glyphs).map((part) =>
    part.kind === "icon" ? part.file : `"${part.text}"`,
  );
}

describe(toGlyphParts, () => {
  it("draws each symbol as one icon, in order, spaces kept", () => {
    expect(files("➡️ ♀️ □ ♂️")).toStrictEqual([
      "waxing-icon.png",
      '" "',
      "venus-icon.svg",
      '" "',
      "square-90-icon.png",
      '" "',
      "mars-icon.svg",
    ]);
  });

  it("runs together symbols written with no space between them", () => {
    expect(files("⚷N🌙")).toStrictEqual([
      "chiron-icon.svg",
      "novile-40-icon.png",
      "moon-icon.svg",
    ]);
  });

  it("keeps the hyphens of a pattern's bodies as text", () => {
    expect(files("⊤ ☿-⚷")).toStrictEqual([
      "t-square-icon.png",
      '" "',
      "mercury-icon.svg",
      '"-"',
      "chiron-icon.svg",
    ]);
  });

  it("leaves what has no icon as it is written", () => {
    expect(files("🎯 🌚 U")).toStrictEqual(['"🎯 🌚 U"']);
    expect(files("🌙 → ♊︎2️⃣")).toStrictEqual([
      "moon-icon.svg",
      '" → "',
      "gemini-icon.svg",
      '"2️⃣"',
    ]);
  });

  it("reads an arrow as forming or dissolving only at the start", () => {
    expect(files("➡️")).toStrictEqual(["waxing-icon.png"]);
    expect(files("☿📏➡️")).toStrictEqual(["mercury-icon.svg", '"📏➡️"']);
  });
});
