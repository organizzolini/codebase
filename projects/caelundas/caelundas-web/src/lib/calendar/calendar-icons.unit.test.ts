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
    expect(files("🍕 ☀️")).toStrictEqual(['"🍕 "', "sun-icon.svg"]);
  });

  it("reads an arrow as forming or dissolving only at the start", () => {
    expect(files("➡️")).toStrictEqual(["waxing-icon.png"]);
    expect(files("☿📏➡️")).toStrictEqual([
      "mercury-icon.svg",
      "elongation-icon.svg",
      "east-elongation-icon.svg",
    ]);
    expect(files("☿⬅️📏")).toStrictEqual([
      "mercury-icon.svg",
      "west-elongation-icon.svg",
      "elongation-icon.svg",
    ]);
  });

  it("draws the moon at its farthest and nearest as the moon beside the apsis", () => {
    expect(files("🌙 ☍ 🌚")).toStrictEqual([
      "moon-icon.svg",
      '" "',
      "opposition-180-icon.png",
      '" "',
      "moon-icon.svg",
      "apoapsis-icon.svg",
    ]);
    expect(files("🌙 🔥")).toStrictEqual([
      "moon-icon.svg",
      '" "',
      "periapsis-icon.svg",
    ]);
    expect(files("🌙 ❄️")).toStrictEqual([
      "moon-icon.svg",
      '" "',
      "apoapsis-icon.svg",
    ]);
  });

  it("draws an ingress, its decan and its peak", () => {
    expect(files("🌙 → ♊︎2️⃣")).toStrictEqual([
      "moon-icon.svg",
      '" "',
      "ingress-icon.svg",
      '" "',
      "gemini-icon.svg",
      "ingress-second-decan-icon.svg",
    ]);
    expect(files("🌙 → ♐︎⛰️")).toStrictEqual([
      "moon-icon.svg",
      '" "',
      "ingress-icon.svg",
      '" "',
      "sagitarius-icon.svg",
      "ingress-peak-icon.svg",
    ]);
    expect(files("♑︎3️⃣")).toStrictEqual([
      "capricorn-icon.svg",
      "ingress-third-decan-icon.svg",
    ]);
  });

  it("draws a station's direction and a planet's rise and set", () => {
    expect(files("♀️ ↩️")).toStrictEqual([
      "venus-icon.svg",
      '" "',
      "retrograde-icon.svg",
    ]);
    expect(files("♇ ↪️")).toStrictEqual([
      "pluto-icon.svg",
      '" "',
      "prograde-icon.svg",
    ]);
    expect(files("♀️🌄↥")).toStrictEqual([
      "venus-icon.svg",
      "morning-star-icon.svg",
      "rising-icon.svg",
    ]);
    expect(files("♀️🌇↧")).toStrictEqual([
      "venus-icon.svg",
      "evening-star-icon.svg",
      "setting-2-icon.svg",
    ]);
  });

  it("draws an undecile as its own icon", () => {
    expect(files("⬅️ ♆ U ☊")).toContain("undecile-32.7-icon.svg");
  });

  it("draws the day, the night and each hexadecan by the event's name", () => {
    expect(
      toGlyphParts("☀️", "Daylight").map((part) =>
        part.kind === "icon" ? part.file : part.text,
      ),
    ).toStrictEqual(["day-icon.svg"]);
    expect(toGlyphParts("🌃", "Night")).toMatchObject([
      { file: "night-icon.svg" },
    ]);
    expect(toGlyphParts("❄️", "Thirteenth Hexadecan")).toMatchObject([
      { file: "thirteenth-hexadecan-icon.svg" },
    ]);
    expect(toGlyphParts("🍁", "Ninth Hexadecan")).toMatchObject([
      { file: "ninth-hexadecan-icon.svg" },
    ]);
  });

  it("draws a lone sun as the sun, and a name's icon only for its one symbol", () => {
    expect(toGlyphParts("☀️", "Sunrise")).toMatchObject([
      { file: "sun-icon.svg" },
    ]);
    expect(toGlyphParts("☀️ 🔼", "Daylight")).toMatchObject([
      { file: "sun-icon.svg" },
      { kind: "text" },
      { file: "rising-icon.svg" },
    ]);
  });

  it("draws each dawn, dusk and twilight by the event's name, as the dawn or dusk", () => {
    const fileOf = (glyphs: string, name: string): string | undefined => {
      const [part] = toGlyphParts(glyphs, name);

      return part?.kind === "icon" ? part.file : undefined;
    };

    expect(fileOf("🌄", "Civil Dawn")).toBe("civil-dawn-icon.svg");
    expect(fileOf("🌇", "Civil Dusk")).toBe("civil-dusk-icon.svg");
    expect(fileOf("🌅", "Nautical Dawn")).toBe("nautical-dawn-icon.svg");
    expect(fileOf("🌉", "Nautical Dusk")).toBe("nautical-dusk-icon.svg");
    expect(fileOf("🌠", "Astronomical Dawn")).toBe(
      "astronomical-dawn-icon.svg",
    );
    expect(fileOf("🌌", "Astronomical Dusk")).toBe(
      "astronomical-dusk-icon.svg",
    );
    expect(fileOf("🌠", "Astronomical Twilight (Morning)")).toBe(
      "astronomical-dawn-icon.svg",
    );
    expect(fileOf("🌌", "Astronomical Twilight (Evening)")).toBe(
      "astronomical-dusk-icon.svg",
    );
    expect(fileOf("🌅", "Nautical Twilight (Morning)")).toBe(
      "nautical-dawn-icon.svg",
    );
    expect(fileOf("🌉", "Nautical Twilight (Evening)")).toBe(
      "nautical-dusk-icon.svg",
    );
    expect(fileOf("🌄", "Civil Twilight (Morning)")).toBe(
      "civil-dawn-icon.svg",
    );
    expect(fileOf("🌇", "Civil Twilight (Evening)")).toBe(
      "civil-dusk-icon.svg",
    );
  });

  it("still draws the morning and evening star beside a planet", () => {
    expect(files("♀️🌄↥")).toContain("morning-star-icon.svg");
    expect(files("♀️🌇↧")).toContain("evening-star-icon.svg");
  });

  it("draws an eclipse's frame, its body and the dragon of the lunar nodes", () => {
    expect(files("🌐 ☀️🐉▶️")).toStrictEqual([
      "geocentric-eclipse-icon.svg",
      '" "',
      "sun-icon.svg",
      "north-node-icon.svg",
      "south-node-icon.svg",
      '"▶️"',
    ]);
    expect(files("📍 🌙🐉◀️")).toStrictEqual([
      "local-eclipse-icon.svg",
      '" "',
      "moon-icon.svg",
      "north-node-icon.svg",
      "south-node-icon.svg",
      '"◀️"',
    ]);
  });
});
