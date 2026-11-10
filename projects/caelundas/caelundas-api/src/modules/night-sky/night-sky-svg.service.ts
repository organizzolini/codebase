// The night sky's stars are the HYG star database v4.1
// (https://github.com/astronexus/HYG-Database), stored by caelundas-cli to
// magnitude 6.5 and declination -45 degrees or north. HYG is licensed
// CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/); the stored
// catalog is a derived work and keeps that license and the credit to David
// Nash and the HYG contributors. The constellation figures are d3-celestial's
// (https://github.com/ofrohn/d3-celestial), BSD-3-Clause, Olaf Frohn.

import { Injectable } from "@nestjs/common";

import { NightSkyColorsService } from "./night-sky-colors.service";
import { NightSkyEclipticService } from "./night-sky-ecliptic.service";
import { NightSkyLinesService } from "./night-sky-lines.service";
import { NightSkyOptionsService } from "./night-sky-options.service";
import { NightSkyStarsService } from "./night-sky-stars.service";
import { NightSkyViewService } from "./night-sky-view.service";

import type {
  Motion,
  NightSky,
  NightSkyOptions,
  RenderedStar,
  ResolvedNightSkyOptions,
  SkyGeometry,
  Viewport,
} from "./night-sky.types";

/**
 * Builds the night sky's SVG from the services that frame, draw and color
 * its parts.
 */
@Injectable()
export class NightSkySvgService {
  // 🏗 Dependency Injection

  constructor(
    private readonly colors: NightSkyColorsService,
    private readonly ecliptic: NightSkyEclipticService,
    private readonly lines: NightSkyLinesService,
    private readonly options: NightSkyOptionsService,
    private readonly stars: NightSkyStarsService,
    private readonly view: NightSkyViewService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Joins the definitions, ground, spinning star group and overlay into one
   * SVG.
   */
  private assemble(parts: {
    geometry: SkyGeometry;
    /** The figures, drawn beneath the stars. */
    lines: string;
    motion: Motion;
    options: ResolvedNightSkyOptions;
    rendered: readonly RenderedStar[];
    viewport: Viewport;
  }): string {
    const { geometry, lines, motion, options, rendered, viewport } = parts;
    const spin = options.still
      ? ""
      : this.formatSpin(options.localSiderealDegrees, motion.periodSeconds);
    const start = `rotate(${(-options.localSiderealDegrees).toFixed(3)})`;
    const sky = `${spin}${lines}${this.stars.formatGlowGroup(rendered)}${this.stars.formatStarGroups(rendered)}`;

    return (
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewport.viewBox}" ` +
      `preserveAspectRatio="${viewport.aspectRatio}" role="img" ` +
      `aria-label="Slowly rotating night sky">${this.colors.formatSkyDefinitions(options.backgroundTopColor, options.backgroundBottomColor)}${
        viewport.ground
      }<g transform="translate(${geometry.poleX} ${geometry.poleY.toFixed(1)})"><g${options.still ? ` transform="${start}"` : ""}>${sky}</g></g>${
        viewport.overlay
      }</svg>`
    );
  }

  /**
   * Facing north the sky turns counterclockwise, which is a negative angle in
   * SVG. It starts at minus the local sidereal time.
   */
  private formatSpin(
    localSiderealDegrees: number,
    periodSeconds: number,
  ): string {
    return (
      '<animateTransform attributeName="transform" type="rotate" ' +
      `from="${(-localSiderealDegrees).toFixed(3)}" ` +
      `to="${(-localSiderealDegrees - 360).toFixed(3)}" ` +
      `dur="${periodSeconds.toFixed(1)}s" repeatCount="indefinite"/>`
    );
  }

  // 🌎 Public Methods

  /**
   * Builds the night sky for a place and moment: the real fixed stars, drawn
   * about the north celestial pole, which sits above the top edge of the
   * window, turning as one group with a single animation.
   */
  public build(options: NightSkyOptions): NightSky {
    const resolved = this.options.withDefaults(options);
    const geometry = this.view.computeGeometry(resolved);
    const { inCatalog, rendered } = this.stars.select(geometry, resolved);
    const motion = this.view.computeMotion(geometry, resolved);
    const viewport = this.view.buildViewport(geometry, resolved);
    const lines = this.lines.formatConstellationLines(
      geometry,
      resolved.constellationSegments,
      resolved,
    );
    const svg = this.assemble({
      geometry,
      lines: `${resolved.ecliptic ? this.ecliptic.formatEcliptic(geometry, resolved) : ""}${lines.markup}`,
      motion,
      options: resolved,
      rendered,
      viewport,
    });

    return {
      measurements: {
        bottomAltitudeDegrees: resolved.bottomAltitudeDegrees,
        fieldOfViewClamped: geometry.fieldOfView.clamped,
        fieldOfViewLimitDegrees: geometry.fieldOfView.limitDegrees,
        periodSeconds: motion.periodSeconds,
        poleDistanceAboveScreen: -geometry.poleY,
        realTimeMultiple: motion.realTimeMultiple,
        segmentsDrawn: lines.segmentsDrawn,
        starsDrawn: rendered.length,
        starsInCatalog: inCatalog,
        svgLength: svg.length,
        topAltitudeDegrees:
          resolved.bottomAltitudeDegrees + geometry.fieldOfView.degrees,
        verticalFieldOfViewDegrees: geometry.fieldOfView.degrees,
      },
      svg,
    };
  }
}
