import { Injectable } from "@nestjs/common";

import { roundToCents } from "../shared-tail/round-to-cents.js";

/**
 * Eight frames, six of which only pass the argument along.
 *
 * Each method looks harmless alone; read as a stack, six frames are pure
 * overhead. Same depth as `DeepStackService`, opposite remedy.
 */
@Injectable()
export class ForwardingStackService {
  // 🔏 Private Methods

  /** Forwards, unchanged. */
  private execute(amount: number): number {
    return this.forward(amount);
  }

  /** Rounds the amount, which is the only work on this path. */
  private finish(amount: number): number {
    return roundToCents(amount);
  }

  /** Forwards, unchanged. */
  private forward(amount: number): number {
    return this.perform(amount);
  }

  /** Forwards, unchanged. */
  private perform(amount: number): number {
    return this.relay(amount);
  }

  /** Forwards, unchanged. */
  private process(amount: number): number {
    return this.execute(amount);
  }

  /** Forwards, unchanged. */
  private relay(amount: number): number {
    return this.finish(amount);
  }

  // 🌎 Public Methods

  /** Handles one amount, through six layers that do nothing to it. */
  public handle(amount: number): number {
    return this.process(amount);
  }
}
