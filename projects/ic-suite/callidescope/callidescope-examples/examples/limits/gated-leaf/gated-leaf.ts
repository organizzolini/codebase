import { Injectable } from "@nestjs/common";

/**
 * A leaf package's whole surface: four frames deep, three callees wide.
 *
 * Ordinary code, a finding only because this project declares limits of three
 * frames and two callees in its own `callidescope.config.ts`.
 */
@Injectable()
export class GatedLeafService {
  // 🔏 Private Methods

  /** Ends the chain, which is where the fourth frame is. */
  private finish(key: string): string {
    return key.trim();
  }

  /** Second of the three, one hop from the end. */
  private normalize(key: string): string {
    return this.finish(key);
  }

  /** First of the three, and the way into the chain. */
  private parse(key: string): string {
    return this.normalize(key);
  }

  // 🌎 Public Methods

  /**
   * The project's declared entry point: three direct callees, four frames deep.
   */
  public read(key: string): string {
    return `${this.parse(key)}${this.normalize(key)}${this.finish(key)}`;
  }
}
