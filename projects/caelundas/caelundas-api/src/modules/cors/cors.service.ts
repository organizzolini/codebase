import { Injectable } from "@nestjs/common";

import type { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

/**
 * Works out the CORS options the browser's preflight is answered with.
 */
@Injectable()
export class CorsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * CORS options for the allowed origins: `*` allows all, an empty list
   * none, otherwise only the listed ones.
   */
  public getOptions(origins: string[]): CorsOptions {
    return { origin: origins.includes("*") ? "*" : origins };
  }
}
