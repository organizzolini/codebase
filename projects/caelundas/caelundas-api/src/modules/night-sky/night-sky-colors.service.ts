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
   * Builds the SVG definitions: the vertical gradient of the sky's background
   * and the glow of the brightest stars. The colors are read as hexadecimal
   * and written as `#rrggbb`, so nothing else can reach the markup.
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
   * Reads a hexadecimal color of three or six digits, with or without the
   * `#`, as lowercase `#rrggbb`, or answers the fallback for anything else. A
   * number is never read: the router turns `1e5` into one, and what it meant
   * is gone.
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
