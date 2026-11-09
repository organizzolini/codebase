import { Injectable } from "@nestjs/common";

import type {
  BoundaryCycle,
  BoundaryEdge,
  CycleWalkState,
  FindCyclesArguments,
} from "./boundaries.types";

/**
 * Finds the cycles in a graph within a node set. Cycles are a rule kind of their own because
 * no single-file rule can see them. Scoped to a node set, so a directory's rule ignores
 * unrelated cycles. One cycle is reported per distinct node set.
 */
@Injectable()
export class BoundaryCyclesService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Builds the outgoing-edge map, keeping only edges inside the node set. */
  private buildAdjacency(args: {
    edges: readonly BoundaryEdge[];
    nodeIds: ReadonlySet<string>;
  }): Map<string, string[]> {
    const adjacency = new Map<string, string[]>();

    for (const edge of args.edges) {
      if (!args.nodeIds.has(edge.source) || !args.nodeIds.has(edge.target)) {
        continue;
      }

      const targets = adjacency.get(edge.source) ?? [];

      targets.push(edge.target);
      adjacency.set(edge.source, targets);
    }

    for (const [source, targets] of adjacency) {
      adjacency.set(source, targets.toSorted());
    }

    return adjacency;
  }

  /**
   * The node set a cycle spans. Two walks over the same nodes are one finding, not one per rotation.
   */
  private buildCycleKey(path: readonly string[]): string {
    return [...new Set(path)].toSorted().join(">");
  }

  /** Records the cycle closed by walking back to a node already on the path. */
  private recordCycle(args: {
    source: string;
    state: CycleWalkState;
    target: string;
  }): void {
    const { source, state, target } = args;
    const path = [...state.stack.slice(state.stack.indexOf(target)), target];
    const key = this.buildCycleKey(path);

    if (state.keys.has(key)) {
      return;
    }

    state.keys.add(key);
    state.cycles.push({ path, source, target });
  }

  /** Walks one node's subtree depth-first, recording every cycle it closes. */
  private walk(args: {
    adjacency: Map<string, string[]>;
    node: string;
    state: CycleWalkState;
  }): void {
    const { adjacency, node, state } = args;

    state.onStack.add(node);
    state.stack.push(node);

    for (const next of adjacency.get(node) ?? []) {
      if (state.onStack.has(next)) {
        this.recordCycle({ source: node, state, target: next });
        continue;
      }

      if (!state.visited.has(next)) {
        this.walk({ adjacency, node: next, state });
      }
    }

    state.stack.pop();
    state.onStack.delete(node);
    state.visited.add(node);
  }

  // 🌎 Public Methods

  /**
   * Every cycle inside the given node set. Nodes are walked in sorted order, so output is stable.
   */
  public findCycles(args: FindCyclesArguments): BoundaryCycle[] {
    const adjacency = this.buildAdjacency(args);
    const state: CycleWalkState = {
      cycles: [],
      keys: new Set(),
      onStack: new Set(),
      stack: [],
      visited: new Set(),
    };

    for (const node of [...args.nodeIds].toSorted()) {
      if (!state.visited.has(node)) {
        this.walk({ adjacency, node, state });
      }
    }

    return state.cycles;
  }
}
