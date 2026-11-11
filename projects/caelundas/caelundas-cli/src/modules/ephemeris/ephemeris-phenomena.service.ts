import { Injectable } from "@nestjs/common";
import { pheno_ut } from "sweph";

import { EphemerisConstantsService } from "./ephemeris-constants.service";
import { EphemerisTimeService } from "./ephemeris-time.service";
import { SWISS_EPHEMERIS_FLAGS } from "./ephemeris.constants";
import { assertSwissEphemerisResult } from "./ephemeris.utilities";

import type { Body, Node } from "../caelundas/caelundas.types";
import type { IlluminationEphemeris } from "./ephemeris.types";
import type { Moment } from "moment-timezone";

/**
 * Pheno-based illumination fraction calculations.
 */
@Injectable()
export class EphemerisPhenomenaService {
  // 🏗 Dependency Injection

  constructor(
    private readonly constants: EphemerisConstantsService,
    private readonly time: EphemerisTimeService,
  ) {}

  // 🔐 Private Fields

  /**
   * Sun's constant illumination: its mean magnitude, in place of pheno_ut.
   */
  private static readonly sunIllumination = {
    illumination: 100,
    magnitude: -26.74,
    phaseAngle: 0,
  } as const;

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Minute-by-minute illumination (0-100), apparent magnitude and phase angle
   * for requested bodies; throws when pheno_ut fails for a non-Sun body.
   */
  public computeIlluminationForBody(args: {
    body: Exclude<Body, Node>;
    end: Moment;
    start: Moment;
  }): IlluminationEphemeris {
    const { body, end, start } = args;
    const ephemeris: IlluminationEphemeris = {};
    const swissEphemerisConstant =
      this.constants.getSwissEphemerisConstantForBody(body);
    for (const date of this.time.generateMinutes(start, end)) {
      const { julianDayUniversalTime } = this.time.dateToJulianDays(date);
      const timestamp = date.toISOString();
      if (body === "sun") {
        ephemeris[timestamp] = { ...EphemerisPhenomenaService.sunIllumination };
        continue;
      }
      const result = pheno_ut(
        julianDayUniversalTime,
        swissEphemerisConstant,
        SWISS_EPHEMERIS_FLAGS,
      );
      assertSwissEphemerisResult(result, { body, tool: "pheno_ut" });
      ephemeris[timestamp] = {
        illumination: result.data[1] * 100,
        magnitude: result.data[4],
        phaseAngle: result.data[0],
      };
    }
    return ephemeris;
  }

  /**
   * Computes illumination, magnitude, and phase angle for a non-Sun body at one
   * moment, storing them when requested; throws when pheno_ut fails.
   */
  public computePhenoForBodyMinute(args: {
    body: Exclude<Body, Node>;
    illuminationEphemeris: IlluminationEphemeris;
    julianDayUniversalTime: number;
    needsIllumination: boolean;
    swissEphemerisConstant: number;
    timestamp: string;
  }): void {
    const {
      body,
      illuminationEphemeris,
      julianDayUniversalTime,
      needsIllumination,
      swissEphemerisConstant,
      timestamp,
    } = args;
    const result = pheno_ut(
      julianDayUniversalTime,
      swissEphemerisConstant,
      SWISS_EPHEMERIS_FLAGS,
    );
    assertSwissEphemerisResult(result, { body, tool: "pheno_ut" });
    if (needsIllumination)
      illuminationEphemeris[timestamp] = {
        illumination: result.data[1] * 100,
        magnitude: result.data[4],
        phaseAngle: result.data[0],
      };
  }

  /**
   * Computes illumination for any body (Sun or non-Sun).
   * The Sun is fixed at 100% and never calls pheno_ut.
   */
  public computePhenoForMinute(args: {
    body: Exclude<Body, Node>;
    illuminationEphemeris: IlluminationEphemeris;
    julianDayUniversalTime: number;
    needsIllumination: boolean;
    swissEphemerisConstant: number;
    timestamp: string;
  }): void {
    if (args.body === "sun") {
      // The Sun is always fully illuminated, so there is nothing to ask pheno_ut.
      if (args.needsIllumination)
        args.illuminationEphemeris[args.timestamp] = {
          ...EphemerisPhenomenaService.sunIllumination,
        };
    } else {
      this.computePhenoForBodyMinute(args);
    }
  }
}
