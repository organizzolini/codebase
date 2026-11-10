import { Injectable } from "@nestjs/common";

import { DEFAULT_OPTIONS } from "./night-sky.constants";

import type {
  EclipticStyle,
  LineStyle,
  NightSkyOptions,
  ResolvedNightSkyOptions,
} from "./night-sky.types";

/**
 * Fills the options a caller left out with their defaults.
 */
@Injectable()
export class NightSkyOptionsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Fills the options that set how the sky looks with their defaults.
   */
  private fillAppearance(
    options: NightSkyOptions,
  ): Pick<
    ResolvedNightSkyOptions,
    | "backgroundBottomColor"
    | "backgroundTopColor"
    | "debug"
    | "faintestMagnitude"
    | "starScale"
  > {
    return {
      backgroundBottomColor:
        options.backgroundBottomColor ?? DEFAULT_OPTIONS.backgroundBottomColor,
      backgroundTopColor:
        options.backgroundTopColor ?? DEFAULT_OPTIONS.backgroundTopColor,
      debug: options.debug ?? DEFAULT_OPTIONS.debug,
      faintestMagnitude:
        options.faintestMagnitude ?? DEFAULT_OPTIONS.faintestMagnitude,
      starScale: options.starScale ?? DEFAULT_OPTIONS.starScale,
    };
  }

  /**
   * Fills the options that draw the ecliptic, and how, with their defaults.
   */
  private fillEcliptic(
    options: NightSkyOptions,
  ): EclipticStyle & { ecliptic: boolean } {
    return {
      ecliptic: options.ecliptic ?? DEFAULT_OPTIONS.ecliptic,
      eclipticColor: options.eclipticColor ?? DEFAULT_OPTIONS.eclipticColor,
      eclipticOpacity:
        options.eclipticOpacity ?? DEFAULT_OPTIONS.eclipticOpacity,
      eclipticWidth: options.eclipticWidth ?? DEFAULT_OPTIONS.eclipticWidth,
    };
  }

  /**
   * Fills the options that set how the figures are stroked with their
   * defaults.
   */
  private fillLineStyle(options: NightSkyOptions): LineStyle {
    return {
      lineColor: options.lineColor ?? DEFAULT_OPTIONS.lineColor,
      lineOpacity: options.lineOpacity ?? DEFAULT_OPTIONS.lineOpacity,
      lineWidth: options.lineWidth ?? DEFAULT_OPTIONS.lineWidth,
    };
  }

  /**
   * Fills the options that set what part of the sky shows, and how it moves,
   * with their defaults.
   */
  private fillView(
    options: NightSkyOptions,
  ): Pick<
    ResolvedNightSkyOptions,
    | "bottomAltitudeDegrees"
    | "pixelsPerSecond"
    | "still"
    | "verticalFieldOfViewDegrees"
  > {
    return {
      bottomAltitudeDegrees:
        options.bottomAltitudeDegrees ?? DEFAULT_OPTIONS.bottomAltitudeDegrees,
      pixelsPerSecond:
        options.pixelsPerSecond ?? DEFAULT_OPTIONS.pixelsPerSecond,
      still: options.still ?? DEFAULT_OPTIONS.still,
      verticalFieldOfViewDegrees:
        options.verticalFieldOfViewDegrees ??
        DEFAULT_OPTIONS.verticalFieldOfViewDegrees,
    };
  }

  // 🌎 Public Methods

  /**
   * Fills every option the caller left out with its default.
   */
  public withDefaults(options: NightSkyOptions): ResolvedNightSkyOptions {
    return {
      ...this.fillAppearance(options),
      ...this.fillView(options),
      ...this.fillLineStyle(options),
      ...this.fillEcliptic(options),
      constellationSegments: options.constellationSegments ?? [],
      height: options.height,
      latitudeDegrees: options.latitudeDegrees,
      localSiderealDegrees: options.localSiderealDegrees,
      stars: options.stars,
      width: options.width,
    };
  }
}
