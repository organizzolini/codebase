import { Injectable } from "@nestjs/common";

/**
 * Two roots, promoted for different reasons.
 *
 * `publish` is an `orphan-root`: nothing calls it. `collect` has a caller, yet is a
 * root because this package's `callidescope.config.ts` names its address, the
 * `declared` kind.
 */
@Injectable()
export class DeclaredEntryPointsService {
  // 🔏 Private Methods

  /** Renders whatever was collected, and ends both stacks. */
  private render(entries: string): string {
    return entries.trim();
  }

  // 🌎 Public Methods

  /** The surface this package declares, called from inside it all the same. */
  public collect(entries: string): string {
    return this.render(entries);
  }

  /** Nothing calls this, so nothing had to declare it. */
  public publish(entries: string): string {
    return this.collect(entries);
  }
}
