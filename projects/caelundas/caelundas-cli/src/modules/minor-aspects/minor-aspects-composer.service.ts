import { Injectable } from "@nestjs/common";
import _ from "lodash";

import { LoggerService } from "@codebase/observability";

import { AspectEphemerisService } from "../aspects/aspect-ephemeris.service";
import {
  aspectBodies as minorAspectBodies,
  minorAspects,
} from "../caelundas/caelundas.constants";
import {
  bodyDisplayName,
  isBody,
  isMinorAspect,
} from "../caelundas/caelundas.types";
import {
  symbolByBody,
  symbolByMinorAspect,
} from "../caelundas/symbol-caelundas.constants";
import { ProgressiveUtilitiesService } from "../progressive/progressive-utilities.service";

import type {
  AspectPhase,
  Body,
  MinorAspect,
} from "../caelundas/caelundas.types";
import type { DetectedCalendarEvent } from "../database/database.types";
import type { CoordinateEphemeris } from "../ephemeris/ephemeris.types";
import type {
  AssembleMinorAspectEventArguments,
  ExtractAspectComponentsResult,
} from "./minor-aspects.types";
import type { Moment } from "moment-timezone";

/** Event building and grouping helpers for {@link MinorAspectsService}. */
@Injectable()
export class MinorAspectsComposerService {
  // 🏗 Dependency Injection

  constructor(
    private readonly aspectEphemerisService: AspectEphemerisService,
    private readonly logger: LoggerService,
    private readonly progressiveUtilitiesService: ProgressiveUtilitiesService,
  ) {
    this.logger.setContext(MinorAspectsComposerService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Assembles minor aspect event.
   */
  assembleMinorAspectEvent(
    args: AssembleMinorAspectEventArguments,
  ): DetectedCalendarEvent {
    const { body1, body2, minorAspect, phase, timestamp } = args;
    const body1Capitalized = bodyDisplayName(body1);
    const body2Capitalized = bodyDisplayName(body2);
    const baseTags = [
      "Astronomy",
      "Astrology",
      "Simple Aspect",
      "Minor Aspect",
      body1Capitalized,
      body2Capitalized,
      _.startCase(minorAspect),
    ];
    const { description, phaseEmoji, tags } = this.resolvePhaseDetails({
      baseTags,
      body1Capitalized,
      body2Capitalized,
      minorAspect,
      phase,
    });
    const summary = `${phaseEmoji} ${symbolByBody[body1]} ${symbolByMinorAspect[minorAspect]} ${symbolByBody[body2]} ${description}`;
    this.logger.info("🗓️ Built a calendar event", undefined, {
      at: timestamp.toISOString(),
      summary,
    });
    return {
      description,
      end: timestamp,
      start: timestamp,
      summary,
      tags,
    };
  }

  /**
   * Builds a stable grouping key from sorted bodies plus aspect name for pairing.
   */
  buildGroupKey(event: DetectedCalendarEvent): string {
    const bodiesCapitalized = _.sortBy(
      event.tags.filter((tag) =>
        minorAspectBodies
          .map((minorAspectBody) => bodyDisplayName(minorAspectBody))
          .includes(tag),
      ),
    );
    const aspectCapitalized = event.tags.find((tag) =>
      minorAspects.map((minorAspect) => _.startCase(minorAspect)).includes(tag),
    );
    if (bodiesCapitalized.length === 2 && aspectCapitalized) {
      return `${bodiesCapitalized[0]}-${aspectCapitalized}-${bodiesCapitalized[1]}`;
    }
    return "";
  }

  /**
   * Casts aspect components to types.
   */
  castAspectComponentsToTypes(args: {
    aspectCapitalized: string;
    body1Capitalized: string;
    body2Capitalized: string;
    tags: string[];
  }): { aspect: MinorAspect; body1: Body; body2: Body } {
    const { aspectCapitalized, body1Capitalized, body2Capitalized, tags } =
      args;
    const aspectLower = aspectCapitalized.toLowerCase();
    const body1Lower = body1Capitalized.toLowerCase();
    const body2Lower = body2Capitalized.toLowerCase();
    if (
      !isMinorAspect(aspectLower) ||
      !isBody(body1Lower) ||
      !isBody(body2Lower)
    ) {
      throw new Error(
        `Could not extract typed values from tags: ${tags.join(", ")}`,
      );
    }
    return { aspect: aspectLower, body1: body1Lower, body2: body2Lower };
  }

  /**
   * Extracts aspect components.
   */
  extractAspectComponents(tags: string[]): ExtractAspectComponentsResult {
    const bodiesCapitalized = tags
      .filter((c: string) =>
        minorAspectBodies.map((b: string) => bodyDisplayName(b)).includes(c),
      )
      .toSorted();
    const aspectCapitalized = tags.find((c: string) =>
      minorAspects.map((a: string) => _.startCase(a)).includes(c),
    );
    if (bodiesCapitalized.length !== 2 || !aspectCapitalized)
      throw new Error(`Could not extract aspect info: ${tags.join(", ")}`);
    const body1Capitalized = bodiesCapitalized[0] ?? "";
    const body2Capitalized = bodiesCapitalized[1] ?? "";
    const { aspect, body1, body2 } = this.castAspectComponentsToTypes({
      aspectCapitalized,
      body1Capitalized,
      body2Capitalized,
      tags,
    });
    return {
      aspect,
      aspectCapitalized,
      body1,
      body1Capitalized,
      body2,
      body2Capitalized,
    };
  }

  /**
   * Returns previous/current/next longitudes for one body at minute resolution.
   */
  getLongitudesWindowForBody(args: {
    body: Body;
    coordinateEphemerisByBody: Record<Body, CoordinateEphemeris>;
    minute: Moment;
    nextMinute: Moment;
    previousMinute: Moment;
  }): { current: number; next: number; previous: number } {
    return this.aspectEphemerisService.getLongitudesWindowForBody(args);
  }

  /**
   * Creates one minor-aspect duration event from a matched forming/dissolving pair.
   */
  getMinorAspectProgressiveEvent(
    beginning: DetectedCalendarEvent,
    ending: DetectedCalendarEvent,
  ): DetectedCalendarEvent {
    const {
      aspect,
      aspectCapitalized,
      body1,
      body1Capitalized,
      body2,
      body2Capitalized,
    } = this.extractAspectComponents(beginning.tags);

    const body1Symbol = symbolByBody[body1];
    const body2Symbol = symbolByBody[body2];
    const aspectSymbol = symbolByMinorAspect[aspect];

    return {
      description: `${body1Capitalized} ${aspect} ${body2Capitalized}`,
      end: ending.start,
      start: beginning.start,
      summary: `${body1Symbol}${aspectSymbol}${body2Symbol} ${body1Capitalized} ${aspect} ${body2Capitalized}`,
      tags: [
        "Astronomy",
        "Astrology",
        "Simple Aspect",
        "Minor Aspect",
        body1Capitalized,
        body2Capitalized,
        aspectCapitalized,
      ],
    };
  }

  /**
   * Processes aspect group.
   */
  processAspectGroup(
    aspectGroupKey: string,
    aspectGroupEvents: DetectedCalendarEvent[],
  ): DetectedCalendarEvent[] {
    if (!aspectGroupKey) {
      return [];
    }
    const formingEvents = aspectGroupEvents.filter((event) =>
      event.tags.includes("Forming"),
    );
    const dissolvingEvents = aspectGroupEvents.filter((event) =>
      event.tags.includes("Dissolving"),
    );
    const pairs = this.progressiveUtilitiesService.pairProgressiveEvents(
      formingEvents,
      dissolvingEvents,
      `minor aspect ${aspectGroupKey}`,
    );
    return pairs.map(([beginning, ending]) =>
      this.getMinorAspectProgressiveEvent(beginning, ending),
    );
  }

  /**
   * Resolves phase details.
   */
  resolvePhaseDetails(args: {
    baseTags: string[];
    body1Capitalized: string;
    body2Capitalized: string;
    minorAspect: MinorAspect;
    phase: AspectPhase;
  }): { description: string; phaseEmoji: string; tags: string[] } {
    const { baseTags, body1Capitalized, body2Capitalized, minorAspect, phase } =
      args;
    if (phase === "perfective") {
      return {
        description: `${body1Capitalized} perfective ${minorAspect} ${body2Capitalized}`,
        phaseEmoji: "🎯",
        tags: [...baseTags, "Perfective"],
      };
    }
    if (phase === "forming") {
      return {
        description: `${body1Capitalized} forming ${minorAspect} ${body2Capitalized}`,
        phaseEmoji: "➡️",
        tags: [...baseTags, "Forming"],
      };
    }
    return {
      description: `${body1Capitalized} dissolving ${minorAspect} ${body2Capitalized}`,
      phaseEmoji: "⬅️",
      tags: [...baseTags, "Dissolving"],
    };
  }
}
