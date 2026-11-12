// 🏷️ Types

import type { CodependixBoundaryRule } from "@codependix/configuration";

/** One graph cycle; `source` and `target` are its closing edge. */
export interface BoundaryCycle {
  /** The whole path, with the closing node repeated at the end. */
  readonly path: readonly string[];
  readonly source: string;
  readonly target: string;
}

/** One dependency edge; `implicit` marks Nx `implicitDependencies`. */
export interface BoundaryEdge {
  readonly implicit?: boolean | undefined;
  readonly source: string;
  readonly target: string;
}

/** A built graph, reduced to what rule evaluation needs. */
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

/** One graph node; levels carry different optional fields. */
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

/** Level a graph is built at; finer than `CodependixGraphType`. */
export type CodependixBoundaryLevel =
  | "nestjsModules"
  | "nxProjects"
  | "python"
  | "typescript";

/** Bookkeeping of one depth-first cycle walk, passed as one object. */
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
