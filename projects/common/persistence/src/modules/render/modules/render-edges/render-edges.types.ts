// 🏷️ Types

import type { GraphEdgeMetadata } from "../render-entities/render-entities.types";
import type { GraphTreeTruncation } from "../render-mermaid/render-mermaid.types";
import type { GraphReadOptions } from "../render-options/render-options.types";

/** A frame of the cycle walk: a vertex and its next target. */
export interface GraphEdgesCycleFrame {
  /** The index of the next target to visit. */
  next: number;

  /** The vertex being walked. */
  readonly vertex: GraphEdgesVertex;
}

/** The cycle search's count, walk, and cycles found. */
export interface GraphEdgesCycleSearch {
  /** The vertices visited so far, which numbers the next. */
  count: number;

  /** The cycles found so far, each as its node names. */
  readonly cycles: string[][];

  /** The walk's open frames, innermost last. */
  readonly frames: GraphEdgesCycleFrame[];

  /** The vertices whose component is not yet complete, in visit order. */
  readonly stack: GraphEdgesVertex[];
}

/** One edge row, with endpoints given as text. */
export interface GraphEdgesEdge {
  /** Text drawn on the edge, when the entity declares a label. */
  readonly label?: string;

  /** The source endpoint's value, as text. */
  readonly source: string;

  /** The target endpoint's value, as text. */
  readonly target: string;

  /** A finite number drawn on the edge, when the entity declares a weight. */
  readonly weight?: number;
}

/** What an edge read draws: its edge columns, then read options. */
export interface GraphEdgesOptions extends GraphReadOptions {
  /** How the entity's decorators describe its edge columns. */
  readonly edge: GraphEdgeMetadata;
}

/** The escaped SQL names an edge table is read by. */
export interface GraphEdgesTable {
  /** The primary key columns, which order edges that tie on every sort key. */
  readonly keys: readonly string[];

  /** The label column, when declared. */
  readonly label?: string;

  /** The source endpoint column. */
  readonly source: string;

  /** The table, schema-qualified when its entity names a schema. */
  readonly table: string;

  /** The target endpoint column. */
  readonly target: string;

  /** The weight column, when declared. */
  readonly weight?: string;
}

/** A node of the cycle search, with its targets and state. */
export interface GraphEdgesVertex {
  /** The order it was first visited in; `undefined` until visited. */
  index: number | undefined;

  /** The lowest visit order its walk reaches. */
  lowest: number;

  /** The node's name, as the edges give it. */
  readonly name: string;

  /** Whether its component is not yet complete. */
  onStack: boolean;

  /** The vertices its edges reach, in edge order. */
  readonly targets: GraphEdgesVertex[];
}

/** The edges, ids, and truncations a walk drew. */
export interface GraphEdgesWalk {
  /** The edges drawn, each as a key of its two ends. */
  readonly kept: Set<string>;

  /** The ids shown, roots included. */
  readonly shown: Set<string>;

  /** Each node whose children a cap hid, in walk order. */
  readonly truncations: GraphTreeTruncation[];

  /** The node each shown node was first reached from; roots have none. */
  readonly via: Map<string, string>;
}

/** A walk's links: each node's children, and whether edges run one way. */
export interface GraphLinks {
  /** Each node's children by id; an undirected edge links both ways. */
  readonly children: ReadonlyMap<string, readonly string[]>;

  /** Whether edges run from source to target. */
  readonly directed: boolean;
}
