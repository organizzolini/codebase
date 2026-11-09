import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";

import { ConstellationLine, Star } from "@codebase/caelundas-db";

import {
  canonicalizeNightSkyInput,
  parseNightSkyInput,
  selectConstellationSegments,
} from "./night-sky-input.utilities";
import { NIGHT_SKY_CACHE_SIZE } from "./night-sky.constants";
import {
  buildNightSky,
  computeStartingSiderealDegrees,
} from "./night-sky.utilities";

import type { NightSkyInput } from "./night-sky-input.entities";
import type {
  NightSky,
  NightSkyCatalog,
  ParsedNightSkyInput,
  StarRow,
} from "./night-sky.types";
import type { OnModuleInit } from "@nestjs/common";

/**
 * Serves the night sky. It holds the stars and constellation figures in
 * memory, read once at startup from the rows `caelundas-cli night-sky`
 * ingests into Postgres, so no request pays to query them.
 */
@Injectable()
export class NightSkyService implements OnModuleInit {
  // 🏗 Dependency Injection

  constructor(@InjectEntityManager() private readonly manager: EntityManager) {}

  // 🔐 Private Fields

  /** Built skies by canonical input, least recently used first. */
  private readonly cache = new Map<string, NightSky>();

  private loaded: NightSkyCatalog | undefined;

  // 🔑 Public Fields

  /**
   * Draws the sky for a canonical input.
   */
  private draw(input: ParsedNightSkyInput): NightSky {
    const { constellations, time, ...options } = input;

    return buildNightSky({
      ...options,
      constellationSegments: selectConstellationSegments(
        this.catalog.segments,
        constellations,
      ),
      localSiderealDegrees: computeStartingSiderealDegrees(
        time,
        options.longitudeDegrees,
      ),
      stars: this.catalog.stars,
    });
  }

  // 🔏 Private Methods

  /**
   * The loaded catalog, its stars brightest first.
   */
  public get catalog(): NightSkyCatalog {
    if (this.loaded === undefined) {
      throw new Error("The night sky catalog is not loaded yet");
    }

    return this.loaded;
  }

  // 🌎 Public Methods

  /**
   * Builds the sky for a query, cached by canonical input so repeats and
   * equivalent requests are nearly free.
   */
  public build(input: NightSkyInput): NightSky {
    const canonical = canonicalizeNightSkyInput(parseNightSkyInput(input));
    const key = JSON.stringify(canonical);
    const cached = this.cache.get(key);

    if (cached !== undefined) {
      this.cache.delete(key);
      this.cache.set(key, cached);

      return cached;
    }

    const built = this.draw(canonical);

    this.cache.set(key, built);

    if (this.cache.size > NIGHT_SKY_CACHE_SIZE) {
      this.cache.delete(this.cache.keys().next().value ?? key);
    }

    return built;
  }

  /**
   * Reads the stars and constellation figures from the database, and sorts
   * the stars brightest first, which is the order the builder draws them in.
   */
  public async onModuleInit(): Promise<void> {
    const [stars, lines] = await Promise.all([
      this.manager.getRepository(Star).find(),
      this.manager.getRepository(ConstellationLine).find({
        relations: { constellation: true, fromStar: true, toStar: true },
      }),
    ]);

    this.loaded = {
      segments: lines.flatMap(({ constellation, fromStar, toStar }) =>
        constellation === undefined ||
        fromStar === undefined ||
        toStar === undefined
          ? []
          : [
              {
                from: [
                  fromStar.rightAscensionHours,
                  fromStar.declinationDegrees,
                ],
                name: constellation.name,
                to: [toStar.rightAscensionHours, toStar.declinationDegrees],
                zodiac: constellation.zodiac,
              },
            ],
      ),
      stars: stars
        .map((star): StarRow => [
          star.rightAscensionHours,
          star.declinationDegrees,
          star.magnitude,
          star.colorIndex,
        ])
        .toSorted((a, b) => a[2] - b[2]),
    };
  }
}
