import { constants } from "sweph";

import { EphemerisUnavailableError } from "./ephemeris.constants";

import type { SwissEphemerisSubject } from "./ephemeris.types";

// 🌎 Utilities

/**
 * Throws unless a `calc` or `pheno_ut` result came from the Swiss Ephemeris
 * data files.
 *
 * The result's flag is negative for an error, and otherwise carries the
 * ephemeris that answered. A flag without the Swiss Ephemeris bit means the
 * library fell back to its built-in one, which it does when the files are
 * missing or the date lies outside the years they cover.
 *
 * @throws Error - When the call failed outright.
 * @throws EphemerisUnavailableError - When the built-in ephemeris answered.
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
