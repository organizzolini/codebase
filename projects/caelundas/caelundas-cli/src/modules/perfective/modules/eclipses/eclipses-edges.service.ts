import { Injectable } from "@nestjs/common";

import { LoggerService } from "@codebase/observability";

import { EphemerisService } from "../../../ephemeris/ephemeris.service";
import { BoundarySearchService } from "../../../ephemeris/modules/boundary-search/boundary-search.service";

import { ECLIPSE_EDGE_SCAN_HOURS } from "./eclipses.constants";
import { EclipsesService } from "./eclipses.service";
import { EclipseCalculationService } from "./modules/calculation/eclipse-calculation.service";
import { EclipseGeometryService } from "./modules/geometry/eclipse-geometry.service";

import type { DetectedCalendarEvent } from "../../../calendar-events/calendar-events.types";
import type {
  EdgeEventsFinder,
  SweepWindow,
} from "../../../ephemeris/modules/boundary-search/boundary-search.types";
import type { Input } from "../../../input/input.types";
import type { Moment } from "moment-timezone";

/**
 * Finds the contacts of an eclipse the sweep window cut off, by detecting again
 * over the hours around an eclipse underway at an edge; a contact beyond the
 * range's limit is clipped to it.
 */
@Injectable()
export class EclipsesEdgesService implements EdgeEventsFinder {
  // 🏗 Dependency Injection

  constructor(
    private readonly boundarySearchService: BoundarySearchService,
    private readonly eclipseCalculationService: EclipseCalculationService,
    private readonly eclipseGeometryService: EclipseGeometryService,
    private readonly eclipsesService: EclipsesService,
    private readonly ephemerisService: EphemerisService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(EclipsesEdgesService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Detects every eclipse event over a run of minutes, in order. */
  private detectOver(
    first: Moment,
    last: Moment,
    input: Input,
  ): DetectedCalendarEvent[] {
    const ephemerides = this.ephemerisService.computeAllEphemerides({
      azimuthElevationBodies: ["moon", "sun"],
      coordinateBodies: ["moon", "sun"],
      coordinates: [input.longitude, input.latitude],
      distanceBodies: ["moon", "sun"],
      end: last.clone().add(1, "minute"),
      illuminationBodies: [],
      start: first.clone().subtract(1, "minute"),
    });
    const events: DetectedCalendarEvent[] = [];

    for (
      const minute = first.clone();
      !minute.isAfter(last);
      minute.add(1, "minute")
    ) {
      events.push(
        ...this.eclipsesService.detect({
          minute: minute.clone(),
          moonAzimuthElevationEphemeris:
            ephemerides.azimuthElevationEphemerisByBody.moon,
          moonCoordinateEphemeris: ephemerides.coordinateEphemerisByBody.moon,
          moonDistanceEphemeris: ephemerides.distanceEphemerisByBody.moon,
          sunAzimuthElevationEphemeris:
            ephemerides.azimuthElevationEphemerisByBody.sun,
          sunCoordinateEphemeris: ephemerides.coordinateEphemerisByBody.sun,
          sunDistanceEphemeris: ephemerides.distanceEphemerisByBody.sun,
        }),
      );
    }

    return events;
  }

  /** Whether a solar or a lunar eclipse is in progress somewhere at a minute. */
  private isUnderway(minute: Moment): boolean {
    const ephemerides = this.ephemerisService.computeAllEphemerides({
      azimuthElevationBodies: [],
      coordinateBodies: ["moon", "sun"],
      coordinates: [0, 0],
      distanceBodies: ["moon", "sun"],
      end: minute.clone().add(1, "minute"),
      illuminationBodies: [],
      start: minute.clone().subtract(1, "minute"),
    });
    const { currentCoordinates } =
      this.eclipseCalculationService.getAllEclipseCoordinates({
        minute,
        moonCoordinateEphemeris: ephemerides.coordinateEphemerisByBody.moon,
        moonDistanceEphemeris: ephemerides.distanceEphemerisByBody.moon,
        sunCoordinateEphemeris: ephemerides.coordinateEphemerisByBody.sun,
        sunDistanceEphemeris: ephemerides.distanceEphemerisByBody.sun,
      });

    return [
      this.eclipseGeometryService.getLunarContactGeometry(currentCoordinates),
      this.eclipseGeometryService.getSolarContactGeometry(currentCoordinates),
    ].some((geometry) => geometry.contactLimit > geometry.separation);
  }

  // 🌎 Public Methods

  /**
   * The eclipse events just outside the window, found by detecting over the
   * hours either side of an edge an eclipse is underway at.
   */
  findEdgeEvents(window: SweepWindow, input: Input): DetectedCalendarEvent[] {
    return [window.start, window.end]
      .filter((edge) => this.isUnderway(edge))
      .flatMap((edge) =>
        this.detectOver(
          edge.clone().subtract(ECLIPSE_EDGE_SCAN_HOURS, "hours"),
          edge.clone().add(ECLIPSE_EDGE_SCAN_HOURS, "hours"),
          input,
        ),
      )
      .filter(
        (event) =>
          event.start.isBefore(window.start) || event.start.isAfter(window.end),
      )
      .map((event) => this.boundarySearchService.clip(event, window));
  }
}
