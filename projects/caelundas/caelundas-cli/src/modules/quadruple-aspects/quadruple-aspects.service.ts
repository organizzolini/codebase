import { Injectable } from "@nestjs/common";
import _ from "lodash";

import { QuadrupleAspectsBaseService } from "./quadruple-aspects-base.service";
import { QuadrupleAspectsComposerService } from "./quadruple-aspects-composer.service";

import type { AspectBodies } from "../aspects/aspects.types";
import type { Body } from "../caelundas/caelundas.types";
import type { DetectedCalendarEvent } from "../calendar-events/calendar-events.types";
import type { Moment } from "moment-timezone";

/**
 * Detects and pairs 4-body patterns (Grand Cross, Kite) from simple-aspect snapshots.
 */
@Injectable()
export class QuadrupleAspectsService {
  // 🏗 Dependency Injection

  constructor(
    private readonly quadrupleAspectsBaseService: QuadrupleAspectsBaseService,
    private readonly quadrupleAspectsComposerService: QuadrupleAspectsComposerService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Detects Grand Cross and Kite patterns, rare 4-body configurations, from stored 2-body aspect events.
   * @see {@link composeKites} and {@link composeGrandCrosses}
   */
  detect(args: {
    currentAspectBodies: AspectBodies[];
    minute: Moment;
    previousAspectBodies: AspectBodies[];
  }): DetectedCalendarEvent[] {
    const { currentAspectBodies, minute, previousAspectBodies } = args;
    return [
      ...this.quadrupleAspectsComposerService.composeGrandCrosses({
        currentAspectBodies,
        minute,
        previousAspectBodies,
      }),
      ...this.quadrupleAspectsComposerService.composeKites({
        currentAspectBodies,
        minute,
        previousAspectBodies,
      }),
    ];
  }

  /**
   * Pairs forming and dissolving events per body quartet into progressive events spanning the active period.
   */
  detectProgressive(events: DetectedCalendarEvent[]): DetectedCalendarEvent[] {
    const progressiveEvents: DetectedCalendarEvent[] = [];

    const quadrupleAspectEvents = events.filter((event) =>
      event.tags.includes("Quadruple Aspect"),
    );

    const groupedEvents = _.groupBy(quadrupleAspectEvents, (event) =>
      this.quadrupleAspectsBaseService.makeProgressiveGroupKey(event),
    );

    for (const group of Object.values(groupedEvents)) {
      this.quadrupleAspectsComposerService.collectProgressiveEventsFromGroup(
        group,
        progressiveEvents,
      );
    }

    return progressiveEvents;
  }

  /**
   * Returns the other body in an aspect edge relative to the given body.
   *
   */
  getOtherBody(edge: AspectBodies, body: Body): Body | null {
    return this.quadrupleAspectsBaseService.getOtherBody(edge, body);
  }

  /**
   * Returns `true` if the given aspect edge involves the specified celestial body.
   *
   */
  involvesBody(edge: AspectBodies, body: Body): boolean {
    return edge.bodies[0] === body || edge.bodies[1] === body;
  }
}
