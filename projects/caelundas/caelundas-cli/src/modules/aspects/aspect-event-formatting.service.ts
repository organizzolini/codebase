import { Injectable } from "@nestjs/common";
import _ from "lodash";

import { bodyDisplayName } from "../caelundas/caelundas.types";
import { symbolByBody } from "../caelundas/symbol-caelundas.constants";

import type { AspectPhase, Body } from "../caelundas/caelundas.types";
import type { DetectedCalendarEvent } from "../database/database.types";
import type { LogData } from "@codebase/observability";
import type { Moment } from "moment-timezone";

/**
 * Centralized formatter for aspect-phase markers and aspect calendar event payloads.
 */
@Injectable()
export class AspectEventFormattingService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Resolve tag labels, description text, and emoji for an aspect phase.
   */
  private resolveAspectPhaseDetails(args: {
    aspectName: string;
    baseTags: string[];
    body1Capitalized: string;
    body2Capitalized: string;
    phase: AspectPhase;
  }): { description: string; phaseEmoji: string; tags: string[] } {
    const { aspectName, baseTags, body1Capitalized, body2Capitalized, phase } =
      args;

    if (phase === "perfective") {
      return {
        description: `${body1Capitalized} perfective ${aspectName} ${body2Capitalized}`,
        phaseEmoji: "🎯",
        tags: [...baseTags, "Perfective"],
      };
    }

    if (phase === "forming") {
      return {
        description: `${body1Capitalized} forming ${aspectName} ${body2Capitalized}`,
        phaseEmoji: "➡️",
        tags: [...baseTags, "Forming"],
      };
    }

    return {
      description: `${body1Capitalized} dissolving ${aspectName} ${body2Capitalized}`,
      phaseEmoji: "⬅️",
      tags: [...baseTags, "Dissolving"],
    };
  }

  // 🌎 Public Methods

  /**
   * Build a simple-aspect calendar event (major/minor/specialty) with consistent labels and summary.
   */
  assembleSimpleAspectEvent(args: {
    aspectName: string;
    aspectSymbol: string;
    aspectTag: "Major Aspect" | "Minor Aspect" | "Specialty Aspect";
    body1: Body;
    body2: Body;
    log: (message: string, data?: LogData) => void;
    phase: AspectPhase;
    timestamp: Moment;
  }): DetectedCalendarEvent {
    const {
      aspectName,
      aspectSymbol,
      aspectTag,
      body1,
      body2,
      log,
      phase,
      timestamp,
    } = args;

    const body1Capitalized = bodyDisplayName(body1);
    const body2Capitalized = bodyDisplayName(body2);
    const baseTags = [
      "Astronomy",
      "Astrology",
      "Simple Aspect",
      aspectTag,
      body1Capitalized,
      body2Capitalized,
      _.startCase(aspectName),
    ];
    const { description, phaseEmoji, tags } = this.resolveAspectPhaseDetails({
      aspectName,
      baseTags,
      body1Capitalized,
      body2Capitalized,
      phase,
    });
    const summary = `${phaseEmoji}${symbolByBody[body1]}${aspectSymbol}${symbolByBody[body2]} ${description}`;
    log("🗓️ Built a calendar event", {
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
   * Builds one progressive compound event from a forming and dissolving pair.
   */
  buildProgressiveCompoundEvent(args: {
    descriptionCaseInsensitive?: boolean;
    dissolving: DetectedCalendarEvent;
    forming: DetectedCalendarEvent;
  }): DetectedCalendarEvent {
    const { descriptionCaseInsensitive = false, dissolving, forming } = args;
    const descriptionPattern = descriptionCaseInsensitive
      ? / (forming|exact|dissolving)$/i
      : / (forming|exact|dissolving)$/;

    return {
      description: forming.description.replace(descriptionPattern, ""),
      end: dissolving.start,
      start: forming.start,
      summary: this.spanTitle(forming.summary),
      tags: forming.tags.filter(
        (tag) =>
          tag !== "Forming" && tag !== "Perfective" && tag !== "Dissolving",
      ),
    };
  }

  /**
   * Return the first aspect whose angular condition matches the two longitudes.
   */
  findFirstMatchingAspect<TAspect extends string>(args: {
    aspects: readonly TAspect[];
    isMatchingAspect: (aspect: TAspect) => boolean;
  }): null | TAspect {
    const { aspects, isMatchingAspect } = args;

    for (const aspect of aspects) {
      if (isMatchingAspect(aspect)) {
        return aspect;
      }
    }

    return null;
  }

  /**
   * Returns the summary prefix emoji for an aspect phase.
   */
  getPhaseEmoji(phase: AspectPhase): string {
    if (phase === "forming") {
      return "➡️";
    }

    if (phase === "perfective") {
      return "🎯";
    }

    return "⬅️";
  }

  /**
   * Turns a boundary title into its span's title by dropping the leading phase
   * emoji and the phase word, which a span covering the whole occurrence has not got.
   */
  spanTitle(boundarySummary: string): string {
    return boundarySummary
      .replace(/^(?:➡️|🎯|⬅️)/u, "")
      .replace(/ (?:forming|exact|perfective|dissolving)(?= \(|$)/u, "");
  }
}
