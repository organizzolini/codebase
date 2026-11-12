import { Injectable } from "@nestjs/common";

import { NightSkyProjectionService } from "./night-sky-projection.service";
import {
  DEBUG_LABEL_ATTRIBUTES,
  DEBUG_LINE_ATTRIBUTES,
  DEBUG_MARGIN,
  EARTH_ROTATION_RADIANS_PER_SECOND,
  MINIMUM_FIELD_OF_VIEW_DEGREES,
  POLE_MARGIN_DEGREES,
  RING_MARGIN,
  SIDEREAL_DAY_SECONDS,
} from "./night-sky.constants";

import type {
  FieldOfView,
  Motion,
  ResolvedNightSkyOptions,
  SkyGeometry,
  Viewport,
} from "./night-sky.types";

/**
 * Frames the sky: how it is projected for the window, how fast it turns, and
 * how the SVG fits the window or the zoomed-out tuning view.
 */
@Injectable()
export class NightSkyViewService {
  // 🏗 Dependency Injection

  constructor(private readonly projection: NightSkyProjectionService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Frames the whole ring of visible stars, with the tuning marks drawn over
   * it.
   */
  private debugViewport(
    geometry: SkyGeometry,
    options: ResolvedNightSkyOptions,
  ): Viewport {
    const extent = geometry.outerRadius + DEBUG_MARGIN;
    const left = (geometry.poleX - extent).toFixed(0);
    const top = (geometry.poleY - extent).toFixed(0);
    const side = (2 * extent).toFixed(0);

    return {
      aspectRatio: "xMidYMid meet",
      ground: `<rect x="${left}" y="${top}" width="${side}" height="${side}" fill="url(#sky-background)"/>`,
      overlay: this.formatDebugOverlay(geometry, options),
      viewBox: `${left} ${top} ${side} ${side}`,
    };
  }

  /**
   * The zoomed-out tuning marks: the visible ring, the window and the pole.
   */
  private formatDebugOverlay(
    geometry: SkyGeometry,
    options: ResolvedNightSkyOptions,
  ): string {
    const poleY = geometry.poleY.toFixed(1);

    return (
      `${
        this.formatRing(geometry, geometry.outerRadius) +
        this.formatRing(geometry, Math.max(0, geometry.innerRadius))
      }<rect width="${options.width}" height="${options.height}" fill="#fff" ` +
      `fill-opacity=".06" stroke="#ffb877" stroke-width="1.5" ` +
      `vector-effect="non-scaling-stroke"/>` +
      `<circle cx="${geometry.poleX}" cy="${poleY}" r="26" fill="#ffb877"/>` +
      `<text x="${geometry.poleX + 44}" y="${(geometry.poleY + 22).toFixed(1)}" ${DEBUG_LABEL_ATTRIBUTES}>pole</text>` +
      `<text x="${options.width + 40}" y="${(options.height / 2).toFixed(1)}" ${DEBUG_LABEL_ATTRIBUTES}>screen</text>`
    );
  }

  /**
   * Draws one dashed ring about the pole for the tuning view.
   */
  private formatRing(geometry: SkyGeometry, radius: number): string {
    return (
      `<circle cx="${geometry.poleX}" cy="${geometry.poleY.toFixed(1)}" ` +
      `r="${radius.toFixed(1)}" ${DEBUG_LINE_ATTRIBUTES} ` +
      'stroke-opacity=".35" stroke-dasharray="4 5"/>'
    );
  }

  /**
   * Keeps the pole above the top edge by reducing a field of view that would
   * put it on screen.
   */
  private limitFieldOfView(options: ResolvedNightSkyOptions): FieldOfView {
    const limitDegrees = Math.max(
      MINIMUM_FIELD_OF_VIEW_DEGREES,
      options.latitudeDegrees -
        options.bottomAltitudeDegrees -
        POLE_MARGIN_DEGREES,
    );
    const clamped = options.verticalFieldOfViewDegrees > limitDegrees;

    return {
      clamped,
      degrees: clamped ? limitDegrees : options.verticalFieldOfViewDegrees,
      limitDegrees,
    };
  }

  // 🌎 Public Methods

  /**
   * Fits the SVG to the window, or to the zoomed-out tuning view when asked.
   */
  public buildViewport(
    geometry: SkyGeometry,
    options: ResolvedNightSkyOptions,
  ): Viewport {
    if (options.debug) {
      return this.debugViewport(geometry, options);
    }

    return {
      aspectRatio: "xMidYMid slice",
      ground: `<rect width="${options.width}" height="${options.height}" fill="url(#sky-background)"/>`,
      overlay: "",
      viewBox: `0 0 ${options.width} ${options.height}`,
    };
  }

  /**
   * Projects the sky about the pole, scaled so the window fits the SVG height.
   */
  public computeGeometry(options: ResolvedNightSkyOptions): SkyGeometry {
    const fieldOfView = this.limitFieldOfView(options);
    const bottomPolarDegrees =
      options.latitudeDegrees - options.bottomAltitudeDegrees;
    const topPolarDegrees =
      options.latitudeDegrees -
      (options.bottomAltitudeDegrees + fieldOfView.degrees);
    const scale =
      options.height /
      (this.projection.tangentOfHalfAngle(bottomPolarDegrees) -
        this.projection.tangentOfHalfAngle(topPolarDegrees));
    const poleY = -scale * this.projection.tangentOfHalfAngle(topPolarDegrees);

    return {
      fieldOfView,
      innerRadius: -poleY - RING_MARGIN,
      outerRadius:
        Math.hypot(options.width / 2, options.height - poleY) + RING_MARGIN,
      poleX: options.width / 2,
      poleY,
      scale,
    };
  }

  /**
   * The period giving the requested speed, since speed grows with distance
   * from the pole.
   */
  public computeMotion(
    geometry: SkyGeometry,
    options: ResolvedNightSkyOptions,
  ): Motion {
    const poleToCenter = options.height / 2 - geometry.poleY;
    const realTimeMultiple =
      options.pixelsPerSecond /
      (EARTH_ROTATION_RADIANS_PER_SECOND * poleToCenter);

    return {
      periodSeconds: SIDEREAL_DAY_SECONDS / realTimeMultiple,
      realTimeMultiple,
    };
  }
}
