import { readFile } from "node:fs/promises";

import { Injectable } from "@nestjs/common";

import {
  canonicalizeNightSkyInput,
  parseNightSkyInput,
  selectConstellationSegments,
} from "./night-sky-input.utilities";
import {
  NIGHT_SKY_CACHE_SIZE,
  NIGHT_SKY_CATALOG_FILE,
  nightSkyCatalogSchema,
} from "./night-sky.constants";
import {
  buildNightSky,
  computeStartingSiderealDegrees,
} from "./night-sky.utilities";

import type { NightSkyInput } from "./night-sky-input.entities";
import type {
  NightSky,
  NightSkyCatalog,
  ParsedNightSkyInput,
} from "./night-sky.types";
import type { OnModuleInit } from "@nestjs/common";

/**
 * Serves the night sky. It holds the stars and constellation figures in
 * memory, read once at startup so no request pays to parse them.
 */
@Injectable()
export class NightSkyService implements OnModuleInit {
  // 🏗 Dependency Injection

  constructor() {}

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
   * Reads and validates the bundled catalog, and sorts its stars brightest
   * first, which is the order the builder draws them in.
   */
  public async onModuleInit(): Promise<void> {
    const parsed = nightSkyCatalogSchema.parse(
      JSON.parse(await readFile(NIGHT_SKY_CATALOG_FILE, "utf8")),
    );

    this.loaded = {
      segments: parsed.segments,
      stars: parsed.stars.toSorted((a, b) => a[2] - b[2]),
    };
  }
}
