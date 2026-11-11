import { Injectable } from "@nestjs/common";

import {
  COLOR_DIGITS_PATTERN,
  DEFAULT_OPTIONS,
  STAR_GLOW_DEFINITION,
} from "./night-sky.constants";

/**
 * Reads the colors a query gives and writes the SVG definitions that use
 * them, so nothing but `#rrggbb` can reach the markup.
 */
@Injectable()
export class NightSkyColorsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Builds the sky gradient and star-glow definitions, with colors read as `#rrggbb`.
   */
  public formatSkyDefinitions(topColor: string, bottomColor: string): string {
    return (
      '<defs><linearGradient id="sky-background" x1="0" y1="0" x2="0" y2="1">' +
      `<stop offset="0" stop-color="${this.readColor(topColor, DEFAULT_OPTIONS.backgroundTopColor)}"/>` +
      `<stop offset="1" stop-color="${this.readColor(bottomColor, DEFAULT_OPTIONS.backgroundBottomColor)}"/>` +
      `</linearGradient>${STAR_GLOW_DEFINITION}</defs>`
    );
  }

  /**
   * Reads a color as lowercase `#rrggbb`, else the fallback. Numbers are
   * never read, since the router mangles them.
   */
  public readColor(value: unknown, fallback: string): string {
    if (typeof value !== "string" || !COLOR_DIGITS_PATTERN.test(value)) {
      return fallback;
    }

    const digits = value.replace("#", "").toLowerCase();
    const full =
      digits.length === 3
        ? Array.from(digits, (digit) => `${digit}${digit}`).join("")
        : digits;

    return `#${full}`;
  }
}
