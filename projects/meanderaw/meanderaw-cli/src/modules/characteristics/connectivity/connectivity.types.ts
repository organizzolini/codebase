// 🏷️ Types

/** One edge a Code holds, named by the two points it joins; `from` and `to` match for a single-column Code's wrapped east edge. */
export interface CodeEdge {
  readonly from: string;
  readonly to: string;
}

/**
 * One repeat's ink as a graph: its connected piece count, loop count, and count of points carrying exactly one arm.
 */
export interface Connectivity {
  readonly components: number;
  readonly cycles: number;
  readonly freeEnds: number;
}
