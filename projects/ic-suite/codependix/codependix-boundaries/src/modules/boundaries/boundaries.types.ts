// 🏷️ Types

import type { CodependixBoundaryRule } from "@codependix/configuration";

/**
 * One cycle in a graph. `source` and `target` are the edge that closed it, so callers
 * need not index into `path`.
 */
export interface BoundaryCycle {
  /** The whole path, with the closing node repeated at the end. */
  readonly path: readonly string[];
  readonly source: string;
  readonly target: string;
}

/**
 * One node depending on another. `implicit` marks Nx `implicitDependencies` edges, which
 * import-reading lint rules cannot see; absent elsewhere, not `false`.
 */
export interface BoundaryEdge {
  readonly implicit?: boolean | undefined;
  readonly source: string;
  readonly target: string;
}

/**
 * One built graph, reduced to what rule evaluation needs. Deliberately not the builders'
 * graph types, which would pull their framework dependencies in.
 */
export interface BoundaryGraph {
  readonly edges: readonly BoundaryEdge[];
  /** Which of codependix's four levels this graph was built at. */
  readonly level: CodependixBoundaryLevel;
  readonly nodes: readonly BoundaryNode[];
  /**
   * What the graph covers: an Nx project name, or the workspace.
   * Reported beside each violation, since file paths alone omit the project.
   */
  readonly scope: string;
}

/**
 * One node in a graph. Its fields are optional because levels carry different ones; a selector
 * naming a missing field matches nothing.
 */
export interface BoundaryNode {
  readonly id: string;
  readonly path?: string | undefined;
  readonly project?: string | undefined;
  readonly tags?: readonly string[] | undefined;
}

/** One edge, or one cycle, breaking one declared rule. */
export interface BoundaryViolation {
  /**
   * The whole cycle, closing node repeated, for an `acyclic` rule.
   * Absent for an access rule, which has no path.
   */
  readonly cycle: readonly string[] | undefined;
  readonly level: CodependixBoundaryLevel;
  /** The sentence reported, whether the rule's own or the generated one. */
  readonly message: string;
  /**
   * Projects this violation is charged to, sorted: an access rule's source,
   * or every project owning a cycle node. Decides whether the run fails.
   */
  readonly projects: readonly string[];
  /** The `name` of the rule that reported it. */
  readonly rule: string;
  readonly scope: string;
  readonly source: string;
  readonly target: string;
}

/**
 * The level a graph was built at, or a violation was found at.
 * Finer than `CodependixGraphType`: `fileImports` splits into `typescript` and `python`.
 */
export type CodependixBoundaryLevel =
  | "nestjsModules"
  | "nxProjects"
  | "python"
  | "typescript";

/**
 * The bookkeeping of one depth-first cycle walk. Passed as one object to stay within the
 * three-parameter limit.
 */
export interface CycleWalkState {
  /** Every cycle found so far. */
  readonly cycles: BoundaryCycle[];
  /** Node-set keys of the cycles already recorded, so rotations dedupe. */
  readonly keys: Set<string>;
  /** The nodes on the current path, as a set, for constant-time lookup. */
  readonly onStack: Set<string>;
  /** The nodes on the current path, in order. */
  readonly stack: string[];
  /** Nodes whose whole subtree has been walked. */
  readonly visited: Set<string>;
}

/** Arguments accepted when judging one graph against one level's rules. */
export interface EvaluateBoundariesArguments {
  readonly graph: BoundaryGraph;
  readonly rules: readonly CodependixBoundaryRule[];
}

/** Arguments accepted when finding the cycles in a graph. */
export interface FindCyclesArguments {
  readonly edges: readonly BoundaryEdge[];
  /** The nodes a cycle must lie entirely within. */
  readonly nodeIds: ReadonlySet<string>;
}
