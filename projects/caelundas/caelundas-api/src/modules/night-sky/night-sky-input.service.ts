import { BadRequestException, Injectable } from "@nestjs/common";
import { z } from "zod";

import { NightSkyColorsService } from "./night-sky-colors.service";
import {
  COLOR_DIGITS_PATTERN,
  DEFAULT_OPTIONS,
  MAXIMUM_SIZE_PIXELS,
  MILLISECONDS_PER_MINUTE,
  SIZE_BUCKET_PIXELS,
} from "./night-sky.constants";

import type {
  ConstellationSegment,
  ParsedNightSkyInput,
} from "./night-sky.types";

/**
 * Reads what a query asks for: checks it, fills what it left out, and snaps
 * it to the input a sky is really drawn from.
 */
@Injectable()
export class NightSkyInputService {
  // 🏗 Dependency Injection

  constructor(private readonly colors: NightSkyColorsService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * A color of three or six hexadecimal digits, read as lowercase `#rrggbb`.
   */
  private color(fallback: string): z.ZodType<string, string | undefined> {
    return z
      .string()
      .regex(COLOR_DIGITS_PATTERN)
      .optional()
      .transform((value) => this.colors.readColor(value, fallback));
  }

  /**
   * What a `nightSky` query may ask for, each limit the one the web app's
   * link applied, and each default the builder's.
   */
  private createInputSchema(): z.ZodType<ParsedNightSkyInput> {
    const opacity = z.number().min(0).max(1);
    const strokeWidth = z.number().min(0).max(10);

    return z.object({
      backgroundBottomColor: this.color(DEFAULT_OPTIONS.backgroundBottomColor),
      backgroundTopColor: this.color(DEFAULT_OPTIONS.backgroundTopColor),
      bottomAltitudeDegrees: z
        .number()
        .min(-45)
        .max(89)
        .default(DEFAULT_OPTIONS.bottomAltitudeDegrees),
      constellations: z
        .array(z.string())
        .default(["zodiac"])
        .transform((names) => {
          const slugs = names
            .map((name) => this.toSlug(name))
            .filter((name) => name !== "");

          return slugs.includes("none") ? [] : slugs;
        }),
      debug: z.boolean().default(DEFAULT_OPTIONS.debug),
      ecliptic: z.boolean().default(DEFAULT_OPTIONS.ecliptic),
      eclipticColor: this.color(DEFAULT_OPTIONS.eclipticColor),
      eclipticOpacity: opacity.default(DEFAULT_OPTIONS.eclipticOpacity),
      eclipticWidth: strokeWidth.default(DEFAULT_OPTIONS.eclipticWidth),
      faintestMagnitude: z
        .number()
        .min(-2)
        .max(12)
        .default(DEFAULT_OPTIONS.faintestMagnitude),
      height: z.number().int().min(1).max(MAXIMUM_SIZE_PIXELS),
      latitudeDegrees: z.number().gt(0).max(90).default(90),
      lineColor: this.color(DEFAULT_OPTIONS.lineColor),
      lineOpacity: opacity.default(DEFAULT_OPTIONS.lineOpacity),
      lineWidth: strokeWidth.default(DEFAULT_OPTIONS.lineWidth),
      longitudeDegrees: z.number().min(-360).max(360).default(-74),
      pixelsPerSecond: z
        .number()
        .positive()
        .max(1000)
        .default(DEFAULT_OPTIONS.pixelsPerSecond),
      starScale: z
        .number()
        .positive()
        .max(10)
        .default(DEFAULT_OPTIONS.starScale),
      still: z.boolean().default(DEFAULT_OPTIONS.still),
      time: z.date().default(() => new Date()),
      verticalFieldOfViewDegrees: z
        .number()
        .positive()
        .max(90)
        .default(DEFAULT_OPTIONS.verticalFieldOfViewDegrees),
      width: z.number().int().min(1).max(MAXIMUM_SIZE_PIXELS),
    });
  }

  // 🌎 Public Methods

  /**
   * Checks a query's input, fills what it left out, and refuses what the
   * builder cannot draw with a message naming each field at fault.
   */
  public parse(input: unknown): ParsedNightSkyInput {
    const result = this.createInputSchema().safeParse(input);

    if (!result.success) {
      throw new BadRequestException(z.prettifyError(result.error));
    }

    return result.data;
  }

  /**
   * The figure segments the query asks for: every one for `all`, the twelve
   * zodiac constellations' for `zodiac`, and those of each constellation
   * named.
   */
  public selectConstellationSegments(
    segments: readonly ConstellationSegment[],
    names: readonly string[],
  ): ConstellationSegment[] {
    const wanted = new Set(names);

    return segments.filter(
      (segment) =>
        wanted.has("all") ||
        (segment.zodiac && wanted.has("zodiac")) ||
        wanted.has(this.toSlug(segment.name)),
    );
  }

  /**
   * The input a request is drawn from, snapped so equal skies share a cache key.
   */
  public snap(input: ParsedNightSkyInput): ParsedNightSkyInput {
    const bucket = (pixels: number): number =>
      Math.ceil(pixels / SIZE_BUCKET_PIXELS) * SIZE_BUCKET_PIXELS;

    return {
      ...input,
      constellations: [...new Set(input.constellations)].toSorted(),
      height: bucket(input.height),
      time: new Date(
        Math.floor(input.time.getTime() / MILLISECONDS_PER_MINUTE) *
          MILLISECONDS_PER_MINUTE,
      ),
      width: bucket(input.width),
    };
  }

  /**
   * A constellation's name as a query writes it: lower case, with spaces and
   * hyphens as underscores, so `Ursa Major` is `ursa_major`.
   */
  public toSlug(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replaceAll(/[\s-]+/gu, "_");
  }
}
