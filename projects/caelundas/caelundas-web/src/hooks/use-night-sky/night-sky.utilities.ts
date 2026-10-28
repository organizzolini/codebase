// The night sky is drawn from `use-night-sky.catalog.json`, the HYG star
// database v4.1 (https://github.com/astronexus/HYG-Database) trimmed to
// magnitude 6.5 and declination -30 degrees or north. HYG is licensed
// CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/); the trimmed
// catalog is a derived work and keeps that license and the credit to David
// Nash and the HYG contributors.

import { SiderealTime } from "astronomy-engine";

import { formatSkyDefinitions } from "./night-sky-colors.utilities";
import { resolveOptions } from "./night-sky-options.utilities";
import {
  COLOR_BUCKET_HIGHEST,
  COLOR_BUCKET_LOWEST,
  COLOR_BUCKETS_PER_UNIT,
  COLOR_INDEX_HIGHEST,
  COLOR_INDEX_LOWEST,
  COLOR_SEGMENTS,
  DEBUG_LABEL_ATTRIBUTES,
  DEBUG_LINE_ATTRIBUTES,
  DEBUG_MARGIN,
  DEBUG_STAR_FACTOR,
  DEGREES_PER_HOUR,
  EARTH_ROTATION_RADIANS_PER_SECOND,
  GLOW_MAGNITUDE_LIMIT,
  GLOW_RADIUS_FACTOR,
  J2000_JULIAN_DAY,
  LAST_COLOR_SEGMENT,
  MILLISECONDS_PER_DAY,
  MINIMUM_FIELD_OF_VIEW_DEGREES,
  POLE_MARGIN_DEGREES,
  RADIANS_PER_DEGREE,
  RING_MARGIN,
  SIDEREAL_DAY_SECONDS,
  STAR_RADIUS_BASE,
  STAR_RADIUS_FLOOR,
  STAR_RADIUS_PER_MAGNITUDE,
  UNIX_EPOCH_JULIAN_DAY,
} from "./night-sky.constants";

import type {
  FieldOfView,
  Motion,
  NightSky,
  NightSkyOptions,
  RenderedStar,
  ResolvedNightSkyOptions,
  SelectedStars,
  SkyGeometry,
  StarRow,
  Viewport,
} from "./night-sky.types";

// 🌎 Public Functions

/**
 * Builds the night sky for a place and moment: the real fixed stars, drawn
 * about the north celestial pole, which sits above the top edge of the
 * window, turning as one group with a single animation.
 */
export function buildNightSky(options: NightSkyOptions): NightSky {
  const resolved = resolveOptions(options);
  const geometry = computeGeometry(resolved);
  const { inCatalog, rendered } = selectStars(geometry, resolved);
  const motion = computeMotion(geometry, resolved);
  const viewport = buildViewport(geometry, resolved);
  const svg = assembleSvg({
    geometry,
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

/**
 * Greenwich mean sidereal time in hours. Use it only when astronomy-engine's
 * `SiderealTime` is unavailable; the two agree to within a few seconds.
 */
export function computeGreenwichMeanSiderealHours(date: Date): number {
  const days =
    date.getTime() / MILLISECONDS_PER_DAY +
    UNIX_EPOCH_JULIAN_DAY -
    J2000_JULIAN_DAY;
  const degrees = (280.460_618_37 + 360.985_647_366_29 * days) % 360;

  return ((degrees + 360) % 360) / DEGREES_PER_HOUR;
}

/**
 * Local sidereal time in degrees, from 0 up to 360. Pass astronomy-engine's
 * `SiderealTime(date)` as `greenwichSiderealHours` when it is available.
 */
export function computeLocalSiderealDegrees(
  date: Date,
  longitudeDegrees: number,
  greenwichSiderealHours?: number,
): number {
  const hours =
    greenwichSiderealHours ?? computeGreenwichMeanSiderealHours(date);

  return (((hours * DEGREES_PER_HOUR + longitudeDegrees) % 360) + 360) % 360;
}

/**
 * The angle the sky starts at for a place and moment, from astronomy-engine's
 * apparent sidereal time. The hand-rolled mean sidereal time above is only the
 * fallback when that is unavailable.
 */
export function computeStartingSiderealDegrees(
  date: Date,
  longitudeDegrees: number,
): number {
  return computeLocalSiderealDegrees(
    date,
    longitudeDegrees,
    SiderealTime(date),
  );
}

// 🔏 Private Functions

/**
 * Joins the definitions, ground, spinning star group and overlay into one SVG.
 */
function assembleSvg(parts: {
  geometry: SkyGeometry;
  motion: Motion;
  options: ResolvedNightSkyOptions;
  rendered: readonly RenderedStar[];
  viewport: Viewport;
}): string {
  const { geometry, motion, options, rendered, viewport } = parts;
  const spin = options.still
    ? ""
    : formatSpin(options.localSiderealDegrees, motion.periodSeconds);
  const start = `rotate(${(-options.localSiderealDegrees).toFixed(3)})`;
  const sky = `${spin}${formatGlowGroup(rendered)}${formatStarGroups(rendered)}`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewport.viewBox}" ` +
    `preserveAspectRatio="${viewport.aspectRatio}" role="img" ` +
    `aria-label="Slowly rotating night sky">${formatSkyDefinitions(options.backgroundTopColor, options.backgroundBottomColor)}${
      viewport.ground
    }<g transform="translate(${geometry.poleX} ${geometry.poleY.toFixed(1)})"><g${options.still ? ` transform="${start}"` : ""}>${sky}</g></g>${
      viewport.overlay
    }</svg>`
  );
}

/**
 * Frames the whole ring of visible stars, with the tuning marks drawn over it.
 */
function buildDebugViewport(
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
    overlay: formatDebugOverlay(geometry, options),
    viewBox: `${left} ${top} ${side} ${side}`,
  };
}

/**
 * Fits the SVG to the window, or to the zoomed-out tuning view when asked.
 */
function buildViewport(
  geometry: SkyGeometry,
  options: ResolvedNightSkyOptions,
): Viewport {
  if (options.debug) {
    return buildDebugViewport(geometry, options);
  }

  return {
    aspectRatio: "xMidYMid slice",
    ground: `<rect width="${options.width}" height="${options.height}" fill="url(#sky-background)"/>`,
    overlay: "",
    viewBox: `0 0 ${options.width} ${options.height}`,
  };
}

/**
 * Rounds a color index to the bucket whose circles share one `<g>`.
 */
function colorBucketOf(colorIndex: number): number {
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
function colorFromIndex(colorIndex: number): string {
  const clamped = Math.min(
    COLOR_INDEX_HIGHEST,
    Math.max(COLOR_INDEX_LOWEST, colorIndex),
  );
  const segment =
    COLOR_SEGMENTS.find((candidate) => clamped <= candidate.to) ??
    LAST_COLOR_SEGMENT;
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
 * Projects the sky about the north celestial pole with a stereographic
 * projection, scaled so the window is exactly as tall as the SVG, and finds
 * where the pole falls.
 */
function computeGeometry(options: ResolvedNightSkyOptions): SkyGeometry {
  const fieldOfView = limitFieldOfView(options);
  const bottomPolarDegrees =
    options.latitudeDegrees - options.bottomAltitudeDegrees;
  const topPolarDegrees =
    options.latitudeDegrees -
    (options.bottomAltitudeDegrees + fieldOfView.degrees);
  const scale =
    options.height /
    (tangentOfHalfAngle(bottomPolarDegrees) -
      tangentOfHalfAngle(topPolarDegrees));
  const poleY = -scale * tangentOfHalfAngle(topPolarDegrees);

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
 * Linear speed equals angular speed times distance from the pole, so the
 * period that gives the requested pixels per second follows from how far the
 * window center sits below the pole.
 */
function computeMotion(
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

/**
 * The zoomed-out tuning marks: the visible ring, the window and the pole.
 */
function formatDebugOverlay(
  geometry: SkyGeometry,
  options: ResolvedNightSkyOptions,
): string {
  const poleY = geometry.poleY.toFixed(1);

  return (
    `${
      formatRing(geometry, geometry.outerRadius) +
      formatRing(geometry, Math.max(0, geometry.innerRadius))
    }<rect width="${options.width}" height="${options.height}" fill="#fff" ` +
    `fill-opacity=".06" stroke="#ffb877" stroke-width="1.5" ` +
    `vector-effect="non-scaling-stroke"/>` +
    `<circle cx="${geometry.poleX}" cy="${poleY}" r="26" fill="#ffb877"/>` +
    `<text x="${geometry.poleX + 44}" y="${(geometry.poleY + 22).toFixed(1)}" ${DEBUG_LABEL_ATTRIBUTES}>pole</text>` +
    `<text x="${options.width + 40}" y="${(options.height / 2).toFixed(1)}" ${DEBUG_LABEL_ATTRIBUTES}>screen</text>`
  );
}

/**
 * Groups the glows behind bright stars, or nothing when none is bright.
 */
function formatGlowGroup(rendered: readonly RenderedStar[]): string {
  const glows = rendered.flatMap((star) =>
    star.glow === undefined ? [] : [star.glow],
  );

  return glows.length > 0
    ? `<g fill="url(#star-glow)">${glows.join("")}</g>`
    : "";
}

/**
 * Draws one dashed ring about the pole for the tuning view.
 */
function formatRing(geometry: SkyGeometry, radius: number): string {
  return (
    `<circle cx="${geometry.poleX}" cy="${geometry.poleY.toFixed(1)}" ` +
    `r="${radius.toFixed(1)}" ${DEBUG_LINE_ATTRIBUTES} ` +
    'stroke-opacity=".35" stroke-dasharray="4 5"/>'
  );
}

/**
 * Facing north the sky turns counterclockwise, which is a negative angle in
 * SVG. It starts at minus the local sidereal time.
 */
function formatSpin(
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

/**
 * Groups circles by color bucket, so one `<g>` carries each color and the SVG
 * stays small.
 */
function formatStarGroups(rendered: readonly RenderedStar[]): string {
  const buckets = new Map<number, string[]>();

  for (const star of rendered) {
    const circles = buckets.get(star.colorBucket) ?? [];

    circles.push(star.circle);
    buckets.set(star.colorBucket, circles);
  }

  return Array.from(
    buckets,
    ([bucket, circles]) =>
      `<g fill="${colorFromIndex(bucket / COLOR_BUCKETS_PER_UNIT)}">${circles.join("")}</g>`,
  ).join("");
}

/**
 * Narrows a star that may have been culled to one that was drawn.
 */
function isRendered(value: RenderedStar | undefined): value is RenderedStar {
  return value !== undefined;
}

/**
 * Keeps the pole above the top edge by reducing a field of view that would
 * put it on screen.
 */
function limitFieldOfView(options: ResolvedNightSkyOptions): FieldOfView {
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

/**
 * Draws one star, or returns nothing when its ring never crosses the window.
 * Facing north, right ascension increases clockwise on screen.
 */
function renderStar(
  geometry: SkyGeometry,
  star: StarRow,
  options: ResolvedNightSkyOptions,
): RenderedStar | undefined {
  const [rightAscensionHours, declinationDegrees, magnitude, colorIndex] = star;
  const radius = geometry.scale * tangentOfHalfAngle(90 - declinationDegrees);

  if (radius < geometry.innerRadius || radius > geometry.outerRadius) {
    return undefined;
  }

  const angle = rightAscensionHours * DEGREES_PER_HOUR * RADIANS_PER_DEGREE;
  const center = `cx="${(radius * Math.sin(angle)).toFixed(1)}" cy="${(-radius * Math.cos(angle)).toFixed(1)}"`;
  const size = starRadius(magnitude, options);

  return {
    circle: `<circle ${center} r="${size.toFixed(2)}"/>`,
    colorBucket: colorBucketOf(colorIndex),
    glow:
      magnitude < GLOW_MAGNITUDE_LIMIT
        ? `<circle ${center} r="${(size * GLOW_RADIUS_FACTOR).toFixed(2)}"/>`
        : undefined,
  };
}

/**
 * Draws the stars bright enough and on rings that cross the window.
 */
function selectStars(
  geometry: SkyGeometry,
  options: ResolvedNightSkyOptions,
): SelectedStars {
  const offered = options.stars.filter(
    (star) => star[2] <= options.faintestMagnitude,
  );
  const rendered = offered
    .map((star) => renderStar(geometry, star, options))
    .filter((star) => isRendered(star));

  return { inCatalog: offered.length, rendered };
}

/**
 * Sizes a star dot from its magnitude, the scale and the tuning view.
 */
function starRadius(
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

/**
 * The tangent of half an angle given in degrees, as the projection needs.
 */
function tangentOfHalfAngle(degrees: number): number {
  return Math.tan((degrees * RADIANS_PER_DEGREE) / 2);
}
