import { readFile } from "node:fs/promises";

import { Injectable } from "@nestjs/common";

import { NightSkyInputService } from "./night-sky-input.service";
import { NightSkySiderealTimeService } from "./night-sky-sidereal-time.service";
import { NightSkySvgService } from "./night-sky-svg.service";
import {
  NIGHT_SKY_CACHE_SIZE,
  NIGHT_SKY_CATALOG_FILE,
  nightSkyCatalogSchema,
} from "./night-sky.constants";

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

  constructor(
    private readonly input: NightSkyInputService,
    private readonly siderealTime: NightSkySiderealTimeService,
    private readonly svg: NightSkySvgService,
  ) {}

  // 🔐 Private Fields

  /** Built skies by snapped input, least recently used first. */
  private readonly cache = new Map<string, NightSky>();

  private loaded: NightSkyCatalog | undefined;

  // 🔑 Public Fields

  /**
   * Draws the sky for a snapped input.
   */
  private draw(input: ParsedNightSkyInput): NightSky {
    const { constellations, time, ...options } = input;

    return this.svg.build({
      ...options,
      constellationSegments: this.input.selectConstellationSegments(
        this.catalog.segments,
        constellations,
      ),
      localSiderealDegrees: this.siderealTime.startingDegrees(
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
   * Builds the night sky a query asks for, from the stars and figures held
   * in memory, refusing input the builder cannot draw. A sky is built from
   * its snapped input, and kept so that a repeat request, or one for a
   * moment or size that rounds to the same, costs almost nothing.
   */
  public build(input: NightSkyInput): NightSky {
    const snapped = this.input.snap(this.input.parse(input));
    const key = JSON.stringify(snapped);
    const cached = this.cache.get(key);

    if (cached !== undefined) {
      this.cache.delete(key);
      this.cache.set(key, cached);

      return cached;
    }

    const built = this.draw(snapped);

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
