import { Injectable } from "@nestjs/common";

import type { InkAdjacency } from "./graph.types";

/**
 * The graph primitives, stated over an adjacency and nothing else. Nothing
 * here knows what was counted: both ink readings are reduced to
 * {@link InkAdjacency}.
 */
@Injectable()
export class GraphService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Marks every node reachable from `start` along an edge as visited. */
  private walk<Node>(
    adjacency: InkAdjacency<Node>,
    start: Node,
    visited: Set<string>,
  ): void {
    const pending: Node[] = [start];

    visited.add(adjacency.key(start));

    for (let node = pending.pop(); node !== undefined; node = pending.pop()) {
      for (const neighbor of adjacency.neighbors(node)) {
        const key = adjacency.key(neighbor);

        if (!visited.has(key)) {
          visited.add(key);
          pending.push(neighbor);
        }
      }
    }
  }

  // 🌎 Public Methods

  /**
   * How many connected pieces a graph falls into. A node joined to nothing is
   * its own piece.
   */
  components<Node>(adjacency: InkAdjacency<Node>): number {
    const visited = new Set<string>();
    let components = 0;

    for (const node of adjacency.nodes) {
      if (!visited.has(adjacency.key(node))) {
        components += 1;
        this.walk(adjacency, node, visited);
      }
    }

    return components;
  }
}
