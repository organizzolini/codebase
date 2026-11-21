import { Injectable } from "@nestjs/common";

/**
 * Passes a callback to a dependency, which gets its own frame.
 *
 * `Array.prototype.map` is external, so it is a leaf. The arrow handed to it is local code, so it is a frame and its calls are followed.
 */
@Injectable()
export class CallbackArgumentService {
  // 🔏 Private Methods

  /** Upper-cases one entry. */
  private shout(entry: string): string {
    return entry.toUpperCase();
  }

  // 🌎 Public Methods

  /** Shouts every entry, through a callback `map` invokes. */
  public shoutAll(entries: readonly string[]): string[] {
    return entries.map((entry) => this.shout(entry));
  }
}
