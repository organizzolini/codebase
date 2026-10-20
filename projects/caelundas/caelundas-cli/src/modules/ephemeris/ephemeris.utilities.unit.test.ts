import { constants } from "sweph";
import { describe, expect, it } from "vitest";

import { EphemerisUnavailableError } from "./ephemeris.constants";
import { assertSwissEphemerisResult } from "./ephemeris.utilities";

describe(assertSwissEphemerisResult, () => {
  const subject = { body: "mars", tool: "calc" };

  it("accepts a calc result computed from the Swiss Ephemeris files", () => {
    expect(() => {
      assertSwissEphemerisResult(
        { error: "", flag: constants.SEFLG_SWIEPH | constants.SEFLG_SPEED },
        subject,
      );
    }).not.toThrow();
  });

  it("accepts a pheno_ut result, whose flag is the ephemeris alone", () => {
    expect(() => {
      assertSwissEphemerisResult(
        { error: "", flag: constants.SEFLG_SWIEPH },
        { body: "moon", tool: "pheno_ut" },
      );
    }).not.toThrow();
  });

  it("throws the library's error when the call failed", () => {
    expect(() => {
      assertSwissEphemerisResult({ error: "boom", flag: -1 }, subject);
    }).toThrow("calc failed for mars: boom");
  });

  it("does not mistake a failure for a fallback", () => {
    expect(() => {
      assertSwissEphemerisResult({ error: "boom", flag: -1 }, subject);
    }).not.toThrow(EphemerisUnavailableError);
  });

  it("throws when the built-in Moshier ephemeris answered a calc", () => {
    expect(() => {
      assertSwissEphemerisResult(
        {
          error: "SwissEph file 'sepl_18.se1' not found\nusing Moshier eph.; ",
          flag: constants.SEFLG_MOSEPH | constants.SEFLG_SPEED,
        },
        subject,
      );
    }).toThrow(EphemerisUnavailableError);
  });

  it("throws when the built-in Moshier ephemeris answered a pheno_ut", () => {
    expect(() => {
      assertSwissEphemerisResult(
        { error: "", flag: constants.SEFLG_MOSEPH },
        { body: "moon", tool: "pheno_ut" },
      );
    }).toThrow("pheno_ut for moon did not use the Swiss Ephemeris files");
  });
});
