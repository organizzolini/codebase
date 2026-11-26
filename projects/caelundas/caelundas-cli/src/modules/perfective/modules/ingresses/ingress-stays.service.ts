import { Injectable } from "@nestjs/common";
import _ from "lodash";

import { LoggerService } from "@codebase/observability";

import { ingressBodies } from "../../../caelundas/caelundas.constants";
import { bodyDisplayName } from "../../../caelundas/caelundas.types";
import {
  symbolByBody,
  symbolByDecan,
  symbolBySign,
} from "../../../caelundas/symbol-caelundas.constants";

import {
  DECAN_TAG_BY_DECAN,
  DECAN_ZONES,
  HALF_SYMBOL_BY_HALF,
  HALF_TAG_BY_HALF,
  HALF_ZONES,
  ZONE_STAY_KINDS,
} from "./ingresses.constants";
import { SignTransitsService } from "./sign-transits.service";

import type { Body } from "../../../caelundas/caelundas.types";
import type { DetectedCalendarEvent } from "../../../calendar-events/calendar-events.types";
import type { SweepWindow } from "../../../ephemeris/modules/boundary-search/boundary-search.types";
import type { ZoneStay } from "./ingresses.types";
import type { Moment } from "moment-timezone";

/**
 * Builds each body's stays in a decan and a half of a sign, between the sign,
 * decan and peak ingresses that change the slice. Each slice is sampled from
 * the ephemeris, since a retrograde body re-enters the last decan, which tags
 * cannot say.
 */
@Injectable()
export class IngressStaysService {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly signTransitsService: SignTransitsService,
  ) {
    this.logger.setContext(IngressStaysService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Builds the stay of a body in one decan of a sign. */
  private buildDecanStay(body: Body, stay: ZoneStay): DetectedCalendarEvent {
    const { decan, sign } = this.pickZone(DECAN_ZONES, stay.index);
    const bodyCapitalized = bodyDisplayName(body);
    const signCapitalized = _.startCase(sign);
    const description = `${bodyCapitalized} in decan ${decan} ${signCapitalized}`;

    return {
      description,
      end: stay.end,
      start: stay.start,
      summary: `${symbolByBody[body]}${symbolByDecan[decan]}${symbolBySign[sign]} ${description}`,
      tags: [
        "Astronomy",
        "Astrology",
        "Ingress",
        "Decan",
        DECAN_TAG_BY_DECAN[decan],
        bodyCapitalized,
        signCapitalized,
      ],
    };
  }

  /** Builds the stay of a body in one half of a sign. */
  private buildHalfStay(body: Body, stay: ZoneStay): DetectedCalendarEvent {
    const { half, sign } = this.pickZone(HALF_ZONES, stay.index);
    const bodyCapitalized = bodyDisplayName(body);
    const signCapitalized = _.startCase(sign);
    const ordinal = half === "1" ? "first" : "second";
    const description = `${bodyCapitalized} in ${ordinal} half of ${signCapitalized}`;

    return {
      description,
      end: stay.end,
      start: stay.start,
      summary: `${symbolByBody[body]}${HALF_SYMBOL_BY_HALF[half]}${symbolBySign[sign]} ${description}`,
      tags: [
        "Astronomy",
        "Astrology",
        "Ingress",
        "Peak",
        HALF_TAG_BY_HALF[half],
        bodyCapitalized,
        signCapitalized,
      ],
    };
  }

  /**
   * The minutes a body changed slice, from its sign ingresses and from the
   * ingresses carrying the boundary tag.
   */
  private getChangeMinutes(args: {
    body: Body;
    boundaryTag: string;
    events: DetectedCalendarEvent[];
  }): Moment[] {
    const { body, boundaryTag, events } = args;
    const bodyCapitalized = bodyDisplayName(body);
    const changes = events.filter(
      (event) =>
        event.tags.includes("Ingress") &&
        event.tags.includes(bodyCapitalized) &&
        (event.tags.includes(boundaryTag) ||
          (!event.tags.includes("Decan") && !event.tags.includes("Peak"))),
    );

    return _.uniqBy(
      _.sortBy(changes, (event) => event.start.valueOf()),
      (event) => event.start.valueOf(),
    ).map((event) => event.start);
  }

  /**
   * A body's stays in each slice, from the one underway at the window start to
   * the one outlasting its end.
   */
  private getStays(args: {
    body: Body;
    changes: Moment[];
    size: number;
    window: SweepWindow;
  }): ZoneStay[] {
    const { body, changes, size, window } = args;
    const entry = this.signTransitsService.getZoneEntry({ body, size, window });
    const exit = this.signTransitsService.getZoneExit({ body, size, window });
    const starts = [entry.start, ...changes];
    const indexes = [
      entry.index,
      ...changes.map((change) =>
        this.signTransitsService.getZoneAt(body, change, size),
      ),
    ];

    return starts
      .map((start, position) => ({
        end: starts[position + 1] ?? exit,
        index: indexes[position] ?? entry.index,
        start,
      }))
      .filter((stay) => stay.end.isAfter(stay.start));
  }

  /** The slice a stay's index names; throws when it lies outside the zodiac. */
  private pickZone<Zone>(zones: readonly Zone[], index: number): Zone {
    const zone = zones[index];

    if (zone === undefined) {
      throw new Error(`🚫 Slice ${index} is not in the zodiac.`);
    }

    return zone;
  }

  // 🌎 Public Methods

  /**
   * Every ingress body's stays in each decan and half of a sign across a
   * window, edges at their true minute.
   */
  detect(
    events: DetectedCalendarEvent[],
    window: SweepWindow,
  ): DetectedCalendarEvent[] {
    const stays = ZONE_STAY_KINDS.flatMap(({ boundaryTag, degrees, kind }) =>
      ingressBodies.flatMap((body) =>
        this.getStays({
          body,
          changes: this.getChangeMinutes({ body, boundaryTag, events }),
          size: degrees,
          window,
        }).map((stay) =>
          kind === "decan"
            ? this.buildDecanStay(body, stay)
            : this.buildHalfStay(body, stay),
        ),
      ),
    );

    this.logger.debug("🔍 Detected decan and half stays", undefined, {
      count: stays.length,
    });

    return stays;
  }
}
