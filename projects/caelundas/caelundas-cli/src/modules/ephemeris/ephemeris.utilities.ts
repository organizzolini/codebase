import { constants } from "sweph";

import { EphemerisUnavailableError } from "./ephemeris.constants";

import type { SwissEphemerisSubject } from "./ephemeris.types";

// 🌎 Utilities

/**
 * Throws unless a `calc` or `pheno_ut` result came from the Swiss Ephemeris
 * files; a built-in fallback throws `EphemerisUnavailableError`.
 */
export function assertSwissEphemerisResult(
  result: { error: string; flag: number },
  subject: SwissEphemerisSubject,
): void {
  if (result.flag < 0) {
    throw new Error(
      `${subject.tool} failed for ${subject.body}: ${result.error}`,
    );
  }

  if ((result.flag & constants.SEFLG_SWIEPH) === 0) {
    throw new EphemerisUnavailableError(subject, result.error);
  }
}
