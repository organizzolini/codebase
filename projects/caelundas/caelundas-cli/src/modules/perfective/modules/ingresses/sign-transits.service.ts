import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { EphemerisService } from "../../../ephemeris/ephemeris.service";
import { BoundarySearchService } from "../../../ephemeris/modules/boundary-search/boundary-search.service";

import {
  DEGREES_PER_SIGN,
  SIGN_SEARCH_STEP_MINUTES,
  TROPICAL_SIGNS,
} from "./ingresses.constants";

import type { Body, Sign } from "../../../caelundas/caelundas.types";
import type {
  BoundaryBracket,
  SweepWindow,
} from "../../../ephemeris/modules/boundary-search/boundary-search.types";
import type { Moment } from "moment-timezone";

/**
 * Finds the true start and end of the sign, decan or half stays a sweep window
 * cuts off, probing the ephemeris a day at a time, then bisecting to the minute.
 */
@Injectable()
export class SignTransitsService {
  // 🏗 Dependency Injection

  constructor(
    private readonly boundarySearchService: BoundarySearchService,
    private readonly ephemerisService: EphemerisService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SignTransitsService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Probes from a minute in a zone until the zone differs, then bisects;
   * undefined when the range ends first.
   */
  private findBoundary(args: {
    body: Body;
    direction: -1 | 1;
    edge: Moment;
    from: Moment;
    size: number;
    zone: number;
  }): BoundaryBracket | undefined {
    const { body, direction, edge, from, size, zone } = args;

    return this.boundarySearchService.find({
      direction,
      from,
      isInside: (minute) => this.getZoneAt(body, minute, size) === zone,
      limit: this.boundarySearchService.getLimit(direction, edge),
      stepMinutes: SIGN_SEARCH_STEP_MINUTES,
    });
  }

  /** The sign at a place in the zodiac counted in signs; throws outside it. */
  private signOf(index: number): Sign {
    const sign = TROPICAL_SIGNS[index];

    if (sign === undefined) {
      throw new Error(`🚫 Sign ${index} not in the zodiac.`);
    }

    return sign;
  }

  // 🌎 Public Methods

  /**
   * The sign a sweep's first stay was in, and the minute it began; the
   * range's first minute when it ends first.
   */
  getEntry(body: Body, window: SweepWindow): { sign: Sign; start: Moment } {
    const { index, start } = this.getZoneEntry({
      body,
      size: DEGREES_PER_SIGN,
      window,
    });

    return { sign: this.signOf(index), start };
  }

  /**
   * The minute a sweep's last stay ended; the range's last minute when it
   * ends first.
   */
  getExit(body: Body, window: SweepWindow): Moment {
    return this.getZoneExit({ body, size: DEGREES_PER_SIGN, window });
  }

  /**
   * The ecliptic longitude of a body at one minute, sampled directly from the
   * ephemeris.
   */
  getLongitudeAt(body: Body, minute: Moment): number {
    const ephemeris = this.ephemerisService.getCoordinateEphemerisByBody({
      bodies: [body],
      end: minute,
      start: minute,
      timezone: "UTC",
    })[body];

    return this.ephemerisService.getCoordinateFromEphemeris(
      ephemeris,
      minute.toISOString(),
      "longitude",
    );
  }

  /**
   * The sign a body is in at one minute, sampled directly from the ephemeris.
   */
  getSignAt(body: Body, minute: Moment): Sign {
    return this.signOf(this.getZoneAt(body, minute, DEGREES_PER_SIGN));
  }

  /**
   * The zone, a slice of `size` degrees counted from 0° Aries, a body is in at
   * one minute.
   */
  getZoneAt(body: Body, minute: Moment, size: number): number {
    return Math.floor(this.getLongitudeAt(body, minute) / size);
  }

  /**
   * The zone a sweep's first stay was in, and the minute it began; the
   * range's first minute when it ends first.
   */
  getZoneEntry(args: { body: Body; size: number; window: SweepWindow }): {
    index: number;
    start: Moment;
  } {
    const { body, size, window } = args;
    const before = window.start.clone().subtract(1, "minute");
    const index = this.getZoneAt(body, before, size);
    const boundary = this.findBoundary({
      body,
      direction: -1,
      edge: window.start,
      from: before,
      size,
      zone: index,
    });

    if (boundary === undefined) {
      this.logger.warn("🧭 Clipped a stay at the range start", undefined, {
        body,
        size,
        zone: index,
      });
    }

    return {
      index,
      start:
        boundary?.inside ??
        this.boundarySearchService.getLimit(-1, window.start),
    };
  }

  /**
   * The minute a sweep's last stay ended; the range's last minute when it
   * ends first.
   */
  getZoneExit(args: { body: Body; size: number; window: SweepWindow }): Moment {
    const { body, size, window } = args;
    const boundary = this.findBoundary({
      body,
      direction: 1,
      edge: window.end,
      from: window.end,
      size,
      zone: this.getZoneAt(body, window.end, size),
    });

    if (boundary === undefined) {
      this.logger.warn("🧭 Clipped a stay at the range end", undefined, {
        body,
        size,
      });
    }

    return (
      boundary?.outside ?? this.boundarySearchService.getLimit(1, window.end)
    );
  }
}
