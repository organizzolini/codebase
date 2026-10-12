import { Injectable, Optional } from "@nestjs/common";

import { EphemerisService } from "../ephemeris/ephemeris.service";

import type { AspectPhase, Body } from "../caelundas/caelundas.types";
import type { CoordinateEphemeris } from "../ephemeris/ephemeris.types";
import type { AspectBodies } from "./aspects.types";
import type { Moment } from "moment-timezone";

/**
 * Shared support helpers for aspect detection and phase boundary calculations.
 */
@Injectable()
export class AspectCalculationSupportService {
  // 🏗 Dependency Injection

  constructor(
    @Optional() private readonly ephemerisService?: EphemerisService,
  ) {}

  // 🔐 Private Fields

  /**
   * Windows already read, by the body's ephemeris and then the minute.
   *
   * Every aspect family asks for the same body's window once per pair per
   * minute, which is dozens of identical reads. Keying on the ephemeris
   * object itself lets a day's entries go with it.
   */
  private readonly windowCache = new WeakMap<
    CoordinateEphemeris,
    Map<string, { current: number; next: number; previous: number }>
  >();

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Computes a forming or dissolving boundary by comparing pattern existence between consecutive snapshots.
   */
  determineCompoundPhaseFromSnapshots(args: {
    checkPatternExists: (edges: AspectBodies[]) => boolean;
    currentAspectBodies: AspectBodies[];
    currentMinute: Moment;
    patternBodies: Body[];
    previousAspectBodies: AspectBodies[];
  }): null | { eventMinute: Moment; phase: AspectPhase } {
    const {
      checkPatternExists,
      currentAspectBodies,
      currentMinute,
      patternBodies,
      previousAspectBodies,
    } = args;
    const bodySet = new Set(patternBodies);
    const filterByBodies = (edges: AspectBodies[]): AspectBodies[] =>
      edges.filter(
        (edge) => bodySet.has(edge.bodies[0]) && bodySet.has(edge.bodies[1]),
      );

    const currentFiltered = filterByBodies(currentAspectBodies);
    const previousFiltered = filterByBodies(previousAspectBodies);

    const currentExists = checkPatternExists(currentFiltered);
    const previousExists = checkPatternExists(previousFiltered);

    if (currentExists && !previousExists) {
      return { eventMinute: currentMinute, phase: "forming" };
    }

    // A leg's simple dissolving event marks its last minute in orb, and the
    // registry drops the leg on that same minute, so the pattern dissolves then.
    if (!currentExists && previousExists) {
      return { eventMinute: currentMinute, phase: "dissolving" };
    }

    return null;
  }

  /**
   * Returns previous/current/next longitudes for one body from a body-keyed ephemeris map.
   */
  getLongitudesWindowForBody(args: {
    body: Body;
    coordinateEphemerisByBody: Record<Body, CoordinateEphemeris>;
    minute: Moment;
    nextMinute: Moment;
    previousMinute: Moment;
  }): { current: number; next: number; previous: number } {
    if (!this.ephemerisService) {
      throw new Error(
        "EphemerisService is required for getLongitudesWindowForBody",
      );
    }

    const {
      body,
      coordinateEphemerisByBody,
      minute,
      nextMinute,
      previousMinute,
    } = args;
    const ephemeris = coordinateEphemerisByBody[body];
    const key = `${previousMinute.valueOf()}:${minute.valueOf()}:${nextMinute.valueOf()}`;
    const cached = this.windowCache.get(ephemeris)?.get(key);
    if (cached) {
      return cached;
    }
    const window = this.ephemerisService.getLongitudesWindow({
      ephemeris,
      minute,
      next: nextMinute,
      previous: previousMinute,
    });
    const byMinute =
      this.windowCache.get(ephemeris) ??
      new Map<string, { current: number; next: number; previous: number }>();
    byMinute.set(key, window);
    this.windowCache.set(ephemeris, byMinute);
    return window;
  }
}
