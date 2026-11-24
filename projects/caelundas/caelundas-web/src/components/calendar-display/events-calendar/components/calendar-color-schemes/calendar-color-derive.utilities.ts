import type { OklchColor } from "./calendar-color-schemes.types";

// 🔒 Private Functions

// 🌎 Public Functions

/**
 * Derives a child's color from its parent's: the hue spread across siblings by index, lightness and chroma stepped.
 */
export function deriveChildColor(
  parent: Readonly<OklchColor>,
  position: Readonly<{ depth: number; index: number; siblingCount: number }>,
): string {
  const { depth, index, siblingCount } = position;
  const { chroma, hue, lightness } = parent;
  const spread = Math.min(14, Math.max(8, 6 + siblingCount));
  const offset =
    siblingCount <= 1 ? 0 : (index / (siblingCount - 1) - 0.5) * 2 * spread;
  const step = index % 2 === 0 ? 0.035 : -0.035;
  const nextLightness = Math.min(0.88, Math.max(0.5, lightness + step));
  const nextChroma = Math.max(0.04, chroma * (1 - 0.04 * depth));
  const nextHue = (hue + offset + 360) % 360;

  return `oklch(${nextLightness.toFixed(3)} ${nextChroma.toFixed(3)} ${nextHue.toFixed(1)})`;
}

/**
 * Reads a color as oklch: an `oklch(L C H)` this module wrote, or a `#rrggbb` color code.
 */
export function readOklch(color: string): OklchColor {
  const written = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/.exec(color);

  if (written !== null) {
    return {
      chroma: Number(written[2]),
      hue: Number(written[3]),
      lightness: Number(written[1]),
    };
  }

  const channels: number[] = [];

  for (const start of [1, 3, 5]) {
    const channel = Number.parseInt(color.slice(start, start + 2), 16) / 255;

    channels.push(
      channel <= 0.040_45
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );
  }

  const [red = 0, green = 0, blue = 0] = channels;
  const long = Math.cbrt(
    0.412_221_470_8 * red + 0.536_332_536_3 * green + 0.051_445_992_9 * blue,
  );
  const medium = Math.cbrt(
    0.211_903_498_2 * red + 0.680_699_545_1 * green + 0.107_396_956_6 * blue,
  );
  const short = Math.cbrt(
    0.088_302_461_9 * red + 0.281_718_837_6 * green + 0.629_978_700_5 * blue,
  );
  const a =
    1.977_998_495_1 * long - 2.428_592_205 * medium + 0.450_593_709_9 * short;
  const b =
    0.025_904_037_1 * long + 0.782_771_766_2 * medium - 0.808_675_766 * short;

  return {
    chroma: Math.hypot(a, b),
    hue: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360,
    lightness:
      0.210_454_255_3 * long + 0.793_617_785 * medium - 0.004_072_046_8 * short,
  };
}
