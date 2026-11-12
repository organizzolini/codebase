import { Injectable } from "@nestjs/common";

import type { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

/**
 * Works out the CORS options the browser's preflight is answered with.
 */
@Injectable()
export class CorsService {
  /**
   * Builds the CORS options from the allowed origins: `*` allows every
   * origin, otherwise only the listed ones are echoed back.
   */
  public getOptions(origins: string[]): CorsOptions {
    return { origin: origins.includes("*") ? "*" : origins };
  }
}
