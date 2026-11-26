// 🏷️ Types

import type {
  DataSource,
  getMetadataArgsStorage as getMetadataArgumentsStorage,
  NamingStrategyInterface,
  Relation,
} from "typeorm";

/** A column's decorator arguments, as TypeORM stores them. */
export type GraphColumnArguments = ReturnType<
  typeof getMetadataArgumentsStorage
>["columns"][number];

/** An edge entity a pick can choose: its class, kind, and table. */
export interface GraphEdgeCandidate {
  /** The entity class, which the command reads its metadata by once connected. */
  readonly entity: GraphEntity;

  /** Whether the entity is a directed acyclic graph or a graph. */
  readonly kind: GraphEdgeKind;

  /** The unqualified table name the entity maps to. */
  readonly tableName: string;
}

/** A class-level declaration: `@DirectedAcyclicGraph()`, or `@Graph()` with its direction. */
export interface GraphEdgeDeclaration {
  /** Whether the declared edges are directed. */
  readonly directed: boolean;

  /** The kind the declaration names. */
  readonly kind: GraphEdgeKind;
}

/** Whether an edge entity is a directed acyclic graph or a graph. */
export type GraphEdgeKind = "directed-acyclic-graph" | "graph";

/** How an edge entity is described: its kind, direction, and columns. */
export interface GraphEdgeMetadata {
  /** Whether edges run from source to target. */
  readonly directed: boolean;

  /** Whether the entity is a directed acyclic graph or a graph. */
  readonly kind: GraphEdgeKind;

  /** The property name of the label, when one is declared. */
  readonly labelColumn?: string;

  /** The property name of the source endpoint. */
  readonly sourceColumn: string;

  /** The property name of the target endpoint. */
  readonly targetColumn: string;

  /** The property name of the weight, when one is declared. */
  readonly weightColumn?: string;
}

/** The options `@Graph()` takes; a graph is directed unless `directed` is false. */
export interface GraphEdgeOptions {
  /** Whether edges run from source to target; defaults to true. */
  readonly directed?: boolean;
}

/** What the edge pick reads: entities, accepted kinds, and options. */
export interface GraphEdgePick {
  /** The command's name, which a wrong-kind error names. */
  readonly command: string;

  /** The entity classes the `--entities` globs imported. */
  readonly entities: readonly GraphEntity[];

  /** The `--entities` globs, named in the error when no edge entity matches. */
  readonly globs: readonly string[];

  /** The kinds of edge entity the command draws. */
  readonly kinds: readonly GraphEdgeKind[];

  /** The strategy that maps each entity's name to its table name. */
  readonly namingStrategy: NamingStrategyInterface;

  /** The table `--table` names, or `undefined` to pick the only edge entity. */
  readonly table: string | undefined;
}

/** What the decorators recorded on one class. */
export interface GraphEdgeRecord {
  /** The class-level declarations on the class. */
  readonly declarations: GraphEdgeDeclaration[];

  /** The property names each role decorator marked on the class. */
  readonly properties: Record<GraphEdgeRole, string[]>;
}

/** The decorators that name a property's role on an edge entity. */
export type GraphEdgeRole =
  | "GraphLabel"
  | "GraphSource"
  | "GraphTarget"
  | "GraphWeight";

/** A generated edge row's node relations, plus `Columns`. */
export type GraphEdgeRow<
  NodeRow extends object,
  Columns extends object = object,
> = Columns & {
  /** The node the edge starts at. */
  source?: Relation<NodeRow>;

  /** The node the edge ends at. */
  target?: Relation<NodeRow>;
};

/** The connection and picked edge entity a graph run reads through. */
export interface GraphEdgeTarget {
  /** The connection the edges are read through, not yet open. */
  readonly dataSource: DataSource;

  /** The `@DirectedAcyclicGraph` or `@Graph` entity class the run draws. */
  readonly picked: GraphEntity;
}

/** An entity class; TypeORM reads its `@Entity`. */
export type GraphEntity = new (...args: never[]) => object;

/** The decorator and edge name an error message names. */
export interface GraphGeneratedContext {
  /** The decorator that asked for the edge, such as `@Graph`. */
  readonly decorator: string;

  /** The generated entity's name. */
  readonly edge: string;
}

/** The edge `@Graph({ edge, nodes })` generated, and the entities it joins. */
export interface GraphGeneratedEdge {
  /** The generated entity class, which has no source file. */
  readonly edge: GraphEntity;

  /** The class that declared it, whose rows the edges belong to. */
  readonly graph: GraphEntity;

  /** The entity whose rows the edges join. */
  readonly nodes: GraphEntity;
}

/** A generated column: its property, name, and referenced entity. */
export interface GraphGeneratedEndpoint {
  /** The column's name in the table. */
  readonly column: string;

  /** The primary column the generated one copies its type from. */
  readonly key: GraphColumnArguments;

  /** The column's property, such as `sourceNode`. */
  readonly property: string;

  /** The relation's property: `source` or `target`. */
  readonly relation: string;

  /** The entity the column references. */
  readonly target: GraphEntity;
}

/** The names `@Graph()` takes to generate its edge entity. */
export interface GraphGeneratedNames {
  /** The generated entity's name, which maps to its table. */
  readonly edge: string;

  /** The entity whose rows the edges join. */
  readonly nodes: () => GraphEntity;

  /** The source node's key property; defaults to `sourceNode`. */
  readonly sourceColumn?: string;

  /** The generated table's name, in place of the one `edge` maps to. */
  readonly table?: string;

  /** The target node's key property; defaults to `targetNode`. */
  readonly targetColumn?: string;
}

/** The names of a generated edge that need not be set. */
export type GraphGeneratedOptionalName =
  | "sourceColumn"
  | "table"
  | "targetColumn";

/** The options `@Graph()` takes to generate its edge entity. */
export interface GraphGeneratedOptions
  extends GraphEdgeOptions, GraphGeneratedNames {}

/** What a generated edge needs registered: its two columns, and its table. */
export interface GraphGeneratedPlan {
  /** The source's and target's columns, in that order. */
  readonly endpoints: readonly [GraphGeneratedEndpoint, GraphGeneratedEndpoint];

  /** The table the data source will map the edge to. */
  readonly table: string;

  /** The `table` option as given, or `undefined` when the edge's name picks it. */
  readonly tableOption: string | undefined;
}

/** A `@Tree` entity a pick can choose. */
export interface GraphTreeCandidate {
  /** The entity class, which the command reads its metadata by once connected. */
  readonly entity: GraphEntity;

  /** The unqualified table name the entity maps to. */
  readonly tableName: string;
}

/** The entity classes, naming strategy, and options a tree pick reads. */
export interface GraphTreePick {
  /** The entity classes the `--entities` globs imported. */
  readonly entities: readonly GraphEntity[];

  /** The `--entities` globs, named in the error when no tree matches. */
  readonly globs: readonly string[];

  /** The strategy that maps each entity's name to its table name. */
  readonly namingStrategy: NamingStrategyInterface;

  /** The table `--table` names, or `undefined` to pick the only tree. */
  readonly table: string | undefined;
}

/** The connection and picked `@Tree` entity a tree run reads through. */
export interface GraphTreeTarget {
  /** The connection the tree is read through, not yet open. */
  readonly dataSource: DataSource;

  /** The `@Tree` entity class the run draws. */
  readonly picked: GraphEntity;
}
