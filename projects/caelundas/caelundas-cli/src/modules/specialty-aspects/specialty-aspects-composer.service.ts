import { Injectable } from "@nestjs/common";
import _ from "lodash";

import { LoggerService } from "@codebase/observability";

import {
  aspectBodies as specialtyAspectBodies,
  specialtyAspects,
} from "../caelundas/caelundas.constants";
import {
  bodyDisplayName,
  isBody,
  isSpecialtyAspect,
} from "../caelundas/caelundas.types";
import {
  symbolByBody,
  symbolBySpecialtyAspect,
} from "../caelundas/symbol-caelundas.constants";
import { EphemerisService } from "../ephemeris/ephemeris.service";

import type {
  AspectPhase,
  Body,
  SpecialtyAspect,
  SpecialtyAspectSymbol,
} from "../caelundas/caelundas.types";
import type { DetectedCalendarEvent } from "../database/database.types";
import type { CoordinateEphemeris } from "../ephemeris/ephemeris.types";
import type { Moment } from "moment-timezone";

/**
 * Event building and grouping helpers for {@link SpecialtyAspectsService}.
 */
@Injectable()
export class SpecialtyAspectsComposerService {
  // 🏗 Dependency Injection

  constructor(
    private readonly logger: LoggerService,
    private readonly ephemerisService: EphemerisService,
  ) {
    this.logger.setContext(SpecialtyAspectsComposerService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Builds and logs one specialty-aspect boundary event from pre-resolved display parts.
   */
  buildSpecialtyAspectEventFromParts(args: {
    body1Symbol: string;
    body2Symbol: string;
    description: string;
    phaseEmoji: string;
    specialtyAspectSymbol: SpecialtyAspectSymbol;
    tags: string[];
    timestamp: Moment;
  }): DetectedCalendarEvent {
    const {
      body1Symbol,
      body2Symbol,
      description,
      phaseEmoji,
      specialtyAspectSymbol,
      tags,
      timestamp,
    } = args;
    const summary = `${phaseEmoji}${body1Symbol}${specialtyAspectSymbol}${body2Symbol} ${description}`;
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
   * Extracts aspect bodies from tags.
   */
  extractAspectBodiesFromTags(tags: string[]): {
    aspectCapitalized: string;
    body1Capitalized: string;
    body2Capitalized: string;
  } {
    const bodiesCapitalized = _.sortBy(
      tags.filter((tag) =>
        specialtyAspectBodies.map((b) => bodyDisplayName(b)).includes(tag),
      ),
    );
    const aspectCapitalized = tags.find((tag) =>
      specialtyAspects.map((a) => _.startCase(a)).includes(tag),
    );
    if (bodiesCapitalized.length !== 2 || !aspectCapitalized) {
      throw new Error(
        `Could not extract aspect info from tags: ${tags.join(", ")}`,
      );
    }
    return {
      aspectCapitalized,
      body1Capitalized: bodiesCapitalized[0] ?? "",
      body2Capitalized: bodiesCapitalized[1] ?? "",
    };
  }

  /**
   * Extracts typed aspect values.
   */
  extractTypedAspectValues(args: {
    aspectCapitalized: string;
    body1Capitalized: string;
    body2Capitalized: string;
    tags: string[];
  }): { aspect: SpecialtyAspect; body1: Body; body2: Body } {
    const { aspectCapitalized, body1Capitalized, body2Capitalized, tags } =
      args;
    const aspectLower = aspectCapitalized.toLowerCase();
    const body1Lower = body1Capitalized.toLowerCase();
    const body2Lower = body2Capitalized.toLowerCase();
    if (
      !isSpecialtyAspect(aspectLower) ||
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
   * Returns previous/current/next longitudes for one body at minute resolution.
   */
  getBodyLongitudesWindow(args: {
    ephemeris: CoordinateEphemeris;
    minute: Moment;
    nextMinute: Moment;
    previousMinute: Moment;
  }): { current: number; next: number; previous: number } {
    const { ephemeris, minute, nextMinute, previousMinute } = args;
    return this.ephemerisService.getLongitudesWindow({
      ephemeris,
      minute,
      next: nextMinute,
      previous: previousMinute,
    });
  }

  /**
   * Creates one specialty-aspect duration event from a forming/dissolving pair.
   */
  getSpecialtyAspectProgressiveEvent(
    beginning: DetectedCalendarEvent,
    ending: DetectedCalendarEvent,
  ): DetectedCalendarEvent {
    const { aspectCapitalized, body1Capitalized, body2Capitalized } =
      this.extractAspectBodiesFromTags(beginning.tags);
    const { aspect, body1, body2 } = this.extractTypedAspectValues({
      aspectCapitalized,
      body1Capitalized,
      body2Capitalized,
      tags: beginning.tags,
    });
    const body1Symbol = symbolByBody[body1];
    const body2Symbol = symbolByBody[body2];
    const aspectSymbol = symbolBySpecialtyAspect[aspect];
    return {
      description: `${body1Capitalized} ${aspect} ${body2Capitalized}`,
      end: ending.start,
      start: beginning.start,
      summary: `${body1Symbol}${aspectSymbol}${body2Symbol} ${body1Capitalized} ${aspect} ${body2Capitalized}`,
      tags: [
        "Astronomy",
        "Astrology",
        "Simple Aspect",
        "Specialty Aspect",
        body1Capitalized,
        body2Capitalized,
        aspectCapitalized,
      ],
    };
  }

  /**
   * Resolves tags, description, and emoji marker for the supplied phase.
   */
  phaseFields(args: {
    baseTags: string[];
    body1Capitalized: string;
    body2Capitalized: string;
    phase: AspectPhase;
    specialtyAspect: SpecialtyAspect;
  }): { description: string; phaseEmoji: string; tags: string[] } {
    const {
      baseTags,
      body1Capitalized,
      body2Capitalized,
      phase,
      specialtyAspect,
    } = args;
    if (phase === "perfective") {
      return {
        description: `${body1Capitalized} perfective ${specialtyAspect} ${body2Capitalized}`,
        phaseEmoji: "🎯",
        tags: [...baseTags, "Perfective"],
      };
    }
    if (phase === "forming") {
      return {
        description: `${body1Capitalized} forming ${specialtyAspect} ${body2Capitalized}`,
        phaseEmoji: "➡️",
        tags: [...baseTags, "Forming"],
      };
    }
    return {
      description: `${body1Capitalized} dissolving ${specialtyAspect} ${body2Capitalized}`,
      phaseEmoji: "⬅️",
      tags: [...baseTags, "Dissolving"],
    };
  }

  /**
   * Builds a stable grouping key from sorted bodies plus specialty-aspect label.
   */
  specialtyAspectGroupKey(event: DetectedCalendarEvent): string {
    const bodiesCapitalized = _.sortBy(
      event.tags.filter((tag) =>
        specialtyAspectBodies.map((b) => bodyDisplayName(b)).includes(tag),
      ),
    );
    const aspectCapitalized = event.tags.find((tag) =>
      specialtyAspects.map((a) => _.startCase(a)).includes(tag),
    );
    return bodiesCapitalized.length === 2 && aspectCapitalized
      ? `${bodiesCapitalized[0]}-${aspectCapitalized}-${bodiesCapitalized[1]}`
      : "";
  }
}
