import { Injectable } from "@nestjs/common";

/**
 * A mutually recursive cluster of three, collapsed before depth is measured.
 *
 * `descend`, `branch` and `leaf` form one cycle, condensed into one component of
 * three frames: a floor, so depth never depends on traversal order. `traverse`
 * sits outside it so something calls the cycle.
 */
@Injectable()
export class MutualRecursionService {
  // 🔏 Private Methods

  /** Second of the three, one hop from the leaf. */
  private branch(remaining: number): number {
    return this.leaf(remaining);
  }

  /** First of the three, and the way into the cycle. */
  private descend(remaining: number): number {
    return this.branch(remaining);
  }

  /** Third of the three, which calls back to the first. */
  private leaf(remaining: number): number {
    return remaining <= 0 ? 0 : this.descend(remaining - 1);
  }

  // 🌎 Public Methods

  /** Enters the cycle from outside it, so the cluster has a root above it. */
  public traverse(remaining: number): number {
    return this.descend(remaining);
  }
}
