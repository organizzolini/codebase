import { readFile } from "node:fs/promises";

import { Injectable } from "@nestjs/common";

import {
  NIGHT_SKY_CATALOG_FILE,
  nightSkyCatalogSchema,
} from "./night-sky.constants";

import type { NightSkyCatalog } from "./night-sky.types";
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
