// 🏷️ Types

import type {
  CallableId,
  CallEdge,
  SourceLocation,
  UnresolvedCall,
} from "@callidescope/core";

/** Breadth for every callable measured. */
export interface BreadthMeasurement {
  readonly byCallable: ReadonlyMap<CallableId, CallableBreadth>;
}

/**
 * How many callables one callable calls directly. `calleeIds` holds distinct callees,
 * not call sites.
 */
export interface CallableBreadth {
  readonly breadth: number;
  readonly calleeIds: readonly CallableId[];
}

/** The direct callees and direct callers of one addressed callable. */
export interface CallableDirectCalls {
  readonly callees: readonly CallableReference[];
  readonly callers: readonly CallableReference[];
}

/** One callable named alongside where it is declared. */
export interface CallableReference {
  readonly displayName: string;
  readonly id: CallableId;
  readonly location: SourceLocation;
}

/** The assembled call graph, indexed both ways. */
export interface CallGraph {
  readonly calleeIdsByCaller: ReadonlyMap<CallableId, readonly CallableId[]>;
  readonly callerIdsByCallee: ReadonlyMap<CallableId, readonly CallableId[]>;
  readonly edges: readonly CallEdge[];
  /** Callables holding at least one call that could not be followed. */
  readonly unresolvedCallerIds: ReadonlySet<CallableId>;
  readonly unresolvedCalls: readonly UnresolvedCall[];
}

/** Memoized longest-path result for one component. */
export interface ComponentDepth {
  /** The successor lying on the deepest path, for O(depth) reconstruction. */
  readonly deepestSuccessor: number | undefined;
  readonly depth: number;
  /** True when the deepest path runs through an unfollowable call. */
  readonly reachesUnresolved: boolean;
}

/**
 * The graph with each cycle collapsed into one node, since longest path needs an
 * acyclic graph.
 */
export interface CondensedGraph {
  readonly componentIdByCallable: ReadonlyMap<CallableId, number>;
  readonly memberIdsByComponent: readonly (readonly CallableId[])[];
  readonly successorsByComponent: readonly ReadonlySet<number>[];
}

/** Depth for every component in the condensation. */
export interface DepthMeasurement {
  readonly byComponent: readonly ComponentDepth[];
}

/**
 * Arguments for measuring breadth across the graph. No condensation is needed,
 * since breadth is defined even inside cycles.
 */
export interface MeasureBreadthArguments {
  readonly callableIds: readonly CallableId[];
  readonly graph: CallGraph;
}

/** Arguments for measuring depth across the graph. */
export interface MeasureDepthArguments {
  readonly condensed: CondensedGraph;
  readonly graph: CallGraph;
}
