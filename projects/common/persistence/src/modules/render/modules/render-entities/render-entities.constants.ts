// ♟️ Constants

import { PluralSnakeNamingStrategy } from "../../../postgresql/postgresql.constants";

import type {
  GraphEdgeKind,
  GraphEdgeRecord,
  GraphGeneratedEdge,
} from "./render-entities.types";
import type { NamingStrategyInterface } from "typeorm";

/** The command that draws each kind of edge entity. */
export const COMMAND_OF_KIND: Readonly<Record<GraphEdgeKind, string>> = {
  "directed-acyclic-graph": "render-directed-acyclic-graph-data",
  graph: "render-graph-data",
};

/** The property a generated edge class carries, naming its graph, shared across module reloads. */
export const RENDER_ENTITIES_GENERATED_MARK = Symbol.for(
  "@codebase/persistence/generated-edge-graph",
);

/** The naming strategy every database connection of this package uses. */
export const RENDER_ENTITIES_NAMING: NamingStrategyInterface =
  new PluralSnakeNamingStrategy();

/** The decorator that marks each kind of edge entity. */
export const DECORATOR_OF_KIND: Readonly<Record<GraphEdgeKind, string>> = {
  "directed-acyclic-graph": "@DirectedAcyclicGraph",
  graph: "@Graph",
};

/**
 * An entity file set the command cannot read: a glob that names no file, or
 * entities that do not pick down to one. Its message names the option to fix.
 */
export class RenderEntitiesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = RenderEntitiesError.name;
  }
}

/** A `--entities` glob that matched no file. */
export const renderEntitiesGlobMessage = (glob: string): string =>
  `--entities matched no files: ${glob}`;

/** No tree entity among the files `--entities` named. */
export const renderEntitiesNoTreeMessage = (globs: readonly string[]): string =>
  `No @Tree entity matched --entities ${globs.join(", ")}; decorate an entity with @Tree, or point --entities at the file that defines it`;

/** `--table` names a table no tree entity has. */
export const renderEntitiesNoTableMessage = (
  table: string,
  tables: readonly string[],
): string =>
  `No @Tree entity has table ${table}; the trees found are ${tables.join(", ")}`;

/** No `@DirectedAcyclicGraph` or `@Graph` entity among the files `--entities` named. */
export const renderEntitiesNoEdgeMessage = (globs: readonly string[]): string =>
  `No @DirectedAcyclicGraph or @Graph entity matched --entities ${globs.join(", ")}; decorate an entity with @DirectedAcyclicGraph or @Graph, or point --entities at the file that defines it`;

/** `--table` names a table no edge entity has. */
export const renderEntitiesNoEdgeTableMessage = (
  table: string,
  tables: readonly string[],
): string =>
  `No @DirectedAcyclicGraph or @Graph entity has table ${table}; the edge entities found are ${tables.join(", ")}`;

/** Edge entities found are of a kind the command does not draw. */
export const renderEntitiesEdgeWrongKindMessage = (
  tables: readonly string[],
  command: string,
  other: string,
): string =>
  `${tables.join(", ")} ${tables.length === 1 ? "is" : "are"} not drawn by ${command}; use ${other} instead`;

/** Several edge entities match and `--table` picks none. */
export const renderEntitiesSeveralEdgesMessage = (
  kinds: readonly string[],
  tables: readonly string[],
): string =>
  `Several ${kinds.join(" or ")} entities match --entities: ${tables.join(", ")}; name one with --table`;

/** Several tree entities match and `--table` does not pick one. */
export const renderEntitiesSeveralTreesMessage = (
  tables: readonly string[],
): string =>
  `Several @Tree entities match --entities: ${tables.join(", ")}; name one with --table`;

/**
 * An edge entity the command cannot read: no kind, both kinds, or a missing or
 * repeated endpoint or optional column. Its message names the class and decorator.
 */
export class RenderEntitiesEdgeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = RenderEntitiesEdgeError.name;
  }
}

/** Edge declarations and property names, keyed by class. */
export const renderEntitiesEdgeRecords = new WeakMap<object, GraphEdgeRecord>();

/** The generated edge of each graph or edge class. */
export const renderEntitiesGeneratedEdges = new WeakMap<
  object,
  GraphGeneratedEdge
>();

/** The edge or nodes option given without the other. */
export const renderEntitiesGeneratedPartialMessage = (
  decorator: string,
  given: "edge" | "nodes",
  name: string | undefined,
): string =>
  given === "edge"
    ? `${decorator} names edge ${name ?? ""} but no nodes; name both the edge and the nodes() entity, or neither`
    : `${decorator} names nodes but no edge; name both the edge and the nodes() entity, or neither`;

/** A graph or node without exactly one primary column. */
export const renderEntitiesGeneratedKeyMessage = (
  { decorator, edge }: { readonly decorator: string; readonly edge: string },
  entity: string,
  count: number,
): string =>
  `${entity} has ${String(count)} primary columns, so its ${decorator} edge ${edge} cannot reference it; give it exactly one`;

/** A generated edge whose name or table an entity already has. */
export const renderEntitiesGeneratedCollisionMessage = (
  { decorator, edge }: { readonly decorator: string; readonly edge: string },
  graph: string,
): string =>
  `${decorator} edge ${edge} of ${graph} collides with an entity or table that already exists; name the edge differently`;

/** A graph that marks its own endpoints and generates its edge. */
export const renderEntitiesGeneratedBothMessage = (
  graph: string,
  edge: string,
  role: string,
): string =>
  `${graph} generates its edge ${edge}, so it cannot mark @${role} properties of its own; use one form`;

/** A `nodes` option whose entity cannot be read when the decorator runs. */
export const renderEntitiesGeneratedNodesMessage = (
  { decorator, edge }: { readonly decorator: string; readonly edge: string },
  graph: string,
  reason: string,
): string =>
  `${decorator} edge ${edge} of ${graph} could not read its nodes() entity: ${reason}; import it before the graph, with no import cycle`;

/** A class that carries no `@DirectedAcyclicGraph()` or `@Graph()`. */
export const renderEntitiesEdgeNoKindMessage = (name: string): string =>
  `${name} is not a graph edge: mark it with @DirectedAcyclicGraph() or @Graph()`;

/** A class marked with more than one of `@DirectedAcyclicGraph()` and `@Graph()`. */
export const renderEntitiesEdgeKindsMessage = (name: string): string =>
  `${name} declares more than one of @DirectedAcyclicGraph and @Graph; keep exactly one`;

/** An edge with no property for a required endpoint decorator. */
export const renderEntitiesEdgeMissingMessage = (
  name: string,
  decorator: string,
): string =>
  `${name} has no @${decorator} property; a @DirectedAcyclicGraph or @Graph entity needs one`;

/** An edge with several properties for one decorator that takes one. */
export const renderEntitiesEdgeSeveralMessage = (
  name: string,
  decorator: string,
  properties: readonly string[],
): string =>
  `${name} declares several @${decorator} properties (${properties.join(", ")}); keep one`;
