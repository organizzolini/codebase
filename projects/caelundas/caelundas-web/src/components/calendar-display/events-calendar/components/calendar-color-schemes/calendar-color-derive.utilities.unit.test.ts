import { describe, expect, it } from "vitest";

import { deriveChildColor, readOklch } from "./calendar-color-derive.utilities";

function derive(
  color: string,
  position: Readonly<{ depth: number; index: number; siblingCount: number }>,
): string {
  return deriveChildColor(readOklch(color), position);
}

function readHue(color: string): number {
  return Number(/oklch\([\d.]+ [\d.]+ ([\d.]+)\)/.exec(color)?.[1]);
}

describe(deriveChildColor, () => {
  it("is deterministic and writes an oklch color", () => {
    const first = derive("#3b82f6", {
      depth: 1,
      index: 1,
      siblingCount: 3,
    });

    expect(first).toBe(
      derive("#3b82f6", { depth: 1, index: 1, siblingCount: 3 }),
    );
    expect(first).toMatch(/^oklch\([\d.]+ [\d.]+ [\d.]+\)$/);
  });

  it("keeps siblings within 14 degrees of the parent's hue, apart by index", () => {
    const hues = [0, 1, 2, 3].map((index) =>
      readHue(
        derive("oklch(0.7 0.15 200)", {
          depth: 1,
          index,
          siblingCount: 4,
        }),
      ),
    );

    expect(new Set(hues).size).toBe(4);

    for (const hue of hues) {
      expect(Math.abs(hue - 200)).toBeLessThanOrEqual(14);
    }
  });

  it("keeps lightness and chroma in bounds, down the depths", () => {
    let color = "#f43f5e";

    for (let depth = 1; depth <= 12; depth += 1) {
      color = derive(color, {
        depth,
        index: depth % 3,
        siblingCount: 3,
      });
      const [lightness, chroma] = (/oklch\(([\d.]+) ([\d.]+)/.exec(color) ?? [])
        .slice(1)
        .map(Number);

      expect(lightness).toBeGreaterThanOrEqual(0.5);
      expect(lightness).toBeLessThanOrEqual(0.88);
      expect(chroma).toBeGreaterThanOrEqual(0.04);
    }
  });

  it("leaves a lone child at its parent's hue", () => {
    expect(
      readHue(
        derive("oklch(0.7 0.15 200)", {
          depth: 1,
          index: 0,
          siblingCount: 1,
        }),
      ),
    ).toBe(200);
  });
});
