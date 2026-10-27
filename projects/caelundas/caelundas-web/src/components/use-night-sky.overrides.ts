import { z } from "zod";

import { normalizeHexColor as normalizeHexadecimalColor } from "./use-night-sky.colors";
import { DEFAULT_OBSERVER, DEFAULT_OPTIONS } from "./use-night-sky.constants";

/**
 * The backdrop's settings after the link's `sky.*` keys are applied over the
 * defaults.
 */
export interface NightSkyOverrides {
  backgroundBottomColor: string;
  backgroundTopColor: string;
  bottomAltitudeDegrees: number;
  debug: boolean;
  faintestMagnitude: number;
  latitudeDegrees: number;
  longitudeDegrees: number;
  /** `sky=off` removes the backdrop. */
  off: boolean;
  pixelsPerSecond: number;
  starScale: number;
  verticalFieldOfViewDegrees: number;
}

/**
 * Reads the backdrop's settings from the link. A key that does not parse
 * falls back to its default, so a stale or hand-edited link still opens.
 */
export function readNightSkyOverrides(
  search: Readonly<Record<string, unknown>>,
): NightSkyOverrides {
  return {
    backgroundBottomColor: normalizeHexadecimalColor(
      search["sky.bottom"],
      DEFAULT_OPTIONS.backgroundBottomColor,
    ),
    backgroundTopColor: normalizeHexadecimalColor(
      search["sky.top"],
      DEFAULT_OPTIONS.backgroundTopColor,
    ),
    bottomAltitudeDegrees: readNumber(
      search["sky.altBottom"],
      z.number().min(0).max(89),
      DEFAULT_OPTIONS.bottomAltitudeDegrees,
    ),
    debug: z.boolean().catch(DEFAULT_OPTIONS.debug).parse(search["sky.debug"]),
    faintestMagnitude: readNumber(
      search["sky.maxMag"],
      z.number().min(-2).max(12),
      DEFAULT_OPTIONS.faintestMagnitude,
    ),
    latitudeDegrees: readNumber(
      search["sky.lat"],
      z.number().min(-90).max(90),
      DEFAULT_OBSERVER.latitudeDegrees,
    ),
    longitudeDegrees: readNumber(
      search["sky.lon"],
      z.number().min(-360).max(360),
      DEFAULT_OBSERVER.longitudeDegrees,
    ),
    off: search["sky"] === "off",
    pixelsPerSecond: readNumber(
      search["sky.pixelsPerSecond"],
      z.number().positive().max(1000),
      DEFAULT_OPTIONS.pixelsPerSecond,
    ),
    starScale: readNumber(
      search["sky.starScale"],
      z.number().positive().max(10),
      DEFAULT_OPTIONS.starScale,
    ),
    verticalFieldOfViewDegrees: readNumber(
      search["sky.vFov"],
      z.number().positive().max(90),
      DEFAULT_OPTIONS.verticalFieldOfViewDegrees,
    ),
  };
}

/**
 * Reads a number the schema accepts, or the fallback.
 */
function readNumber(
  value: unknown,
  schema: z.ZodNumber,
  fallback: number,
): number {
  return schema.catch(fallback).parse(value);
}
