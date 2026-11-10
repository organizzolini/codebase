// 🏷️ Types

import type { ProjectGraph } from "@nx/devkit";

/**
 * A project's one-hop neighborhood in the Nx project graph: what it needs and who would
 * break if it changed.
 */
export interface Neighborhood {
  /** Projects this one depends on, sorted. */
  readonly dependencies: string[];
  /** Projects that depend on this one, sorted. */
  readonly dependents: string[];
  /** Every edge to draw, sorted. */
  readonly edges: NeighborhoodEdge[];
  /** The project the neighborhood is centered on. */
  readonly projectName: string;
}

/** One project depending on another. */
export interface NeighborhoodEdge {
  /** True when Nx inferred the dependency from configuration, not from code. */
  readonly implicit: boolean;
  readonly source: string;
  readonly target: string;
}

/** A workspace project the Nx graph knows about. */
export interface NxProject {
  /** Absolute path of the project directory. */
  readonly absoluteRoot: string;
  readonly name: string;
  /**
   * The project's own Nx tags, empty when it declares none. Carried here so
   * tag gates read the project, not the Nx graph.
   */
  readonly tags: string[];
}

/**
 * A workspace's Nx project graph, held as an opaque handle. Read fields from
 * `NxProject` instead, so the Nx concern stays in this package.
 */
export type NxProjectGraph = ProjectGraph;
