import { readFile } from "node:fs/promises";

import { Injectable } from "@nestjs/common";

import {
  parseNightSkyInput,
  selectConstellationSegments,
} from "./night-sky-input.utilities";
import {
  NIGHT_SKY_CATALOG_FILE,
  nightSkyCatalogSchema,
} from "./night-sky.constants";
import {
  buildNightSky,
  computeStartingSiderealDegrees,
} from "./night-sky.utilities";

import type { NightSkyInput } from "./night-sky-input.entities";
import type { NightSky, NightSkyCatalog } from "./night-sky.types";
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

  private loaded: NightSkyCatalog | undefined;

  // 🔑 Public Fields

  /**
   * The loaded catalog, its stars brightest first.
   */
  public get catalog(): NightSkyCatalog {
    if (this.loaded === undefined) {
      throw new Error("The night sky catalog is not loaded yet");
    }

    return this.loaded;
  }

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Builds the night sky a query asks for, from the stars and figures held
   * in memory, refusing input the builder cannot draw.
   */
  public build(input: NightSkyInput): NightSky {
    const { constellations, time, ...options } = parseNightSkyInput(input);

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
