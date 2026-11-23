// ♟️ Constants

import type { GraphEdgeKind, GraphEdgeRecord } from "./render-entities.types";

/** The command that draws each kind of edge entity. */
export const COMMAND_OF_KIND: Readonly<Record<GraphEdgeKind, string>> = {
  "directed-acyclic-graph": "render-directed-acyclic-graph-data",
  graph: "render-graph-data",
};

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
