// 🏷️ Types

/** Arguments for turning a weight pair into a score. */
export interface CalculateScoreArguments {
  /** Combined weight of the requirements the instance failed. */
  readonly failedWeight: number;
  /** Combined weight of the requirements that were checked. */
  readonly totalWeight: number;
}

/** Anything carrying a weight, with no message needed. */
export interface WeightedFinding {
  readonly weight?: number;
}
