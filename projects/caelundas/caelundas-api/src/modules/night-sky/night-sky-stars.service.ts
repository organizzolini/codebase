import { Injectable } from "@nestjs/common";

import { NightSkyProjectionService } from "./night-sky-projection.service";
import {
  COLOR_BUCKET_HIGHEST,
  COLOR_BUCKET_LOWEST,
  COLOR_BUCKETS_PER_UNIT,
  COLOR_INDEX_HIGHEST,
  COLOR_INDEX_LOWEST,
  COLOR_SEGMENTS,
  DEBUG_STAR_FACTOR,
  GLOW_MAGNITUDE_LIMIT,
  GLOW_RADIUS_FACTOR,
  LAST_COLOR_SEGMENT,
  STAR_RADIUS_BASE,
  STAR_RADIUS_FLOOR,
  STAR_RADIUS_PER_MAGNITUDE,
} from "./night-sky.constants";

import type {
  RenderedStar,
  ResolvedNightSkyOptions,
  SelectedStars,
  SkyGeometry,
  StarRow,
} from "./night-sky.types";

/**
 * Draws the stars: which are bright enough and on a ring the window crosses,
 * how big and what color each is, and how they group into SVG markup.
 */
@Injectable()
export class NightSkyStarsService {
  // 🏗 Dependency Injection

  constructor(private readonly projection: NightSkyProjectionService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Rounds a color index to the bucket whose circles share one `<g>`.
   */
  private colorBucketOf(colorIndex: number): number {
    return Math.max(
      COLOR_BUCKET_LOWEST,
      Math.min(
        COLOR_BUCKET_HIGHEST,
        Math.round(colorIndex * COLOR_BUCKETS_PER_UNIT),
      ),
    );
  }

  /**
   * Maps a B−V color index onto the blackbody ramp as a hexadecimal color.
   */
  private colorFromIndex(colorIndex: number): string {
    const clamped = Math.min(
      COLOR_INDEX_HIGHEST,
      Math.max(COLOR_INDEX_LOWEST, colorIndex),
    );
    const segment =
      COLOR_SEGMENTS.slice(0, -1).find(
        (candidate) => clamped <= candidate.to,
      ) ?? LAST_COLOR_SEGMENT;
    const fraction = (clamped - segment.from) / (segment.to - segment.from);
    const [fromRed, fromGreen, fromBlue] = segment.fromColor;
    const [toRed, toGreen, toBlue] = segment.toColor;
    const channels = [
      fromRed + (toRed - fromRed) * fraction,
      fromGreen + (toGreen - fromGreen) * fraction,
      fromBlue + (toBlue - fromBlue) * fraction,
    ];

    return `#${channels
      .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
      .join("")}`;
  }

  /**
   * Narrows a star that may have been culled to one that was drawn.
   */
  private isRendered(value: RenderedStar | undefined): value is RenderedStar {
    return value !== undefined;
  }

  /**
   * Draws one star, or returns nothing when its ring never crosses the
   * window.
   */
  private renderStar(
    geometry: SkyGeometry,
    star: StarRow,
    options: ResolvedNightSkyOptions,
  ): RenderedStar | undefined {
    const [rightAscensionHours, declinationDegrees, magnitude, colorIndex] =
      star;
    const { radius, x, y } = this.projection.project(geometry, [
      rightAscensionHours,
      declinationDegrees,
    ]);

    if (!this.projection.isOnVisibleRing(geometry, radius)) {
      return undefined;
    }

    const center = `cx="${x.toFixed(1)}" cy="${y.toFixed(1)}"`;
    const size = this.starRadius(magnitude, options);

    return {
      circle: `<circle ${center} r="${size.toFixed(2)}"/>`,
      colorBucket: this.colorBucketOf(colorIndex),
      glow:
        magnitude < GLOW_MAGNITUDE_LIMIT
          ? `<circle ${center} r="${(size * GLOW_RADIUS_FACTOR).toFixed(2)}"/>`
          : undefined,
    };
  }

  /**
   * Sizes a star dot from its magnitude, the scale and the tuning view.
   */
  private starRadius(
    magnitude: number,
    options: ResolvedNightSkyOptions,
  ): number {
    return (
      Math.max(
        STAR_RADIUS_FLOOR,
        STAR_RADIUS_BASE - STAR_RADIUS_PER_MAGNITUDE * magnitude,
      ) *
      options.starScale *
      (options.debug ? DEBUG_STAR_FACTOR : 1)
    );
  }

  // 🌎 Public Methods

  /**
   * Groups the glows behind bright stars, or nothing when none is bright.
   */
  public formatGlowGroup(rendered: readonly RenderedStar[]): string {
    const glows = rendered.flatMap((star) =>
      star.glow === undefined ? [] : [star.glow],
    );

    return glows.length > 0
      ? `<g fill="url(#star-glow)">${glows.join("")}</g>`
      : "";
  }

  /**
   * Groups circles by color bucket, so one `<g>` carries each color and the
   * SVG stays small.
   */
  public formatStarGroups(rendered: readonly RenderedStar[]): string {
    const buckets = new Map<number, string[]>();

    for (const star of rendered) {
      const circles = buckets.get(star.colorBucket) ?? [];

      circles.push(star.circle);
      buckets.set(star.colorBucket, circles);
    }

    return Array.from(
      buckets,
      ([bucket, circles]) =>
        `<g fill="${this.colorFromIndex(bucket / COLOR_BUCKETS_PER_UNIT)}">${circles.join("")}</g>`,
    ).join("");
  }

  /**
   * Draws the stars bright enough and on rings that cross the window.
   */
  public select(
    geometry: SkyGeometry,
    options: ResolvedNightSkyOptions,
  ): SelectedStars {
    const offered = options.stars.filter(
      (star) => star[2] <= options.faintestMagnitude,
    );
    const rendered = offered
      .map((star) => this.renderStar(geometry, star, options))
      .filter((star) => this.isRendered(star));

    return { inCatalog: offered.length, rendered };
  }
}
