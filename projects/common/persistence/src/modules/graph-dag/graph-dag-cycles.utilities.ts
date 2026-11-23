// 🌎 Utilities

import type {
  GraphDagCycleFrame,
  GraphDagCycleSearch,
  GraphDagEdge,
  GraphDagVertex,
} from "./graph-dag.types";

/**
 * The cycles among `edges`, each as its sorted node names, ordered by first node.
 * Iterative, so long chains cannot overflow the stack.
 */
export function findDagCycles(
  edges: readonly Pick<GraphDagEdge, "source" | "target">[],
): string[][] {
  const vertices = new Map<string, GraphDagVertex>();
  const vertexOf = (name: string): GraphDagVertex => {
    const existing = vertices.get(name);
    if (existing !== undefined) return existing;
    const created: GraphDagVertex = {
      index: undefined,
      lowest: 0,
      name,
      onStack: false,
      targets: [],
    };
    vertices.set(name, created);
    return created;
  };
  for (const { source, target } of edges) {
    vertexOf(source).targets.push(vertexOf(target));
  }

  const search: GraphDagCycleSearch = {
    count: 0,
    cycles: [],
    frames: [],
    stack: [],
  };
  for (const vertex of vertices.values()) {
    if (vertex.index === undefined) {
      enterVertex(search, vertex);
      for (
        let frame = search.frames.at(-1);
        frame !== undefined;
        frame = search.frames.at(-1)
      ) {
        stepFrame(search, frame);
      }
    }
  }

  return search.cycles
    .map((cycle) => cycle.toSorted())
    .toSorted((first, second) =>
      compareText(first.join("\u0000"), second.join("\u0000")),
    );
}

/** Orders two strings by code unit, the order `toSorted()` gives without a comparator. */
function compareText(first: string, second: string): number {
  if (first === second) return 0;
  return first < second ? -1 : 1;
}

/** Numbers `vertex` in visit order, stacks it, and opens a frame to walk its targets. */
function enterVertex(
  search: GraphDagCycleSearch,
  vertex: GraphDagVertex,
): void {
  vertex.index = search.count;
  vertex.lowest = search.count;
  vertex.onStack = true;
  search.count += 1;
  search.stack.push(vertex);
  search.frames.push({ next: 0, vertex });
}

/** Closes `frame`'s vertex, taking its component off the stack and keeping it when it is a cycle. */
function leaveVertex(
  search: GraphDagCycleSearch,
  { vertex }: GraphDagCycleFrame,
): void {
  search.frames.pop();
  const parent = search.frames.at(-1);
  if (parent !== undefined) {
    parent.vertex.lowest = Math.min(parent.vertex.lowest, vertex.lowest);
  }
  if (vertex.lowest !== vertex.index) return;

  const component = search.stack.splice(search.stack.lastIndexOf(vertex));
  const names: string[] = [];
  for (const member of component) {
    member.onStack = false;
    names.push(member.name);
  }
  if (component.length > 1 || vertex.targets.includes(vertex)) {
    search.cycles.push(names);
  }
}

/** Walks the next target of `frame`'s vertex, or closes the vertex when it has none left. */
function stepFrame(
  search: GraphDagCycleSearch,
  frame: GraphDagCycleFrame,
): void {
  const child = frame.vertex.targets[frame.next];
  if (child === undefined) {
    leaveVertex(search, frame);
    return;
  }

  frame.next += 1;
  if (child.index === undefined) {
    enterVertex(search, child);
  } else if (child.onStack) {
    frame.vertex.lowest = Math.min(frame.vertex.lowest, child.index);
  }
}
