// ♟️ Constants

import type { GraphEdgeKind, GraphEdgeRecord } from "./graph-entities.types";

/** The command that draws each kind of edge entity. */
export const COMMAND_OF_KIND: Readonly<Record<GraphEdgeKind, string>> = {
  dag: "render-dag-data",
  graph: "render-graph-data",
};

/** The decorator that marks each kind of edge entity. */
export const DECORATOR_OF_KIND: Readonly<Record<GraphEdgeKind, string>> = {
  dag: "@Dag",
  graph: "@Graph",
};

/**
 * An entity file set the command cannot read: a glob that names no file, or
 * entities that do not pick down to one. Its message names the option to fix.
 */
export class GraphEntitiesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = GraphEntitiesError.name;
  }
}

/** A `--entities` glob that matched no file. */
export const graphGlobMessage = (glob: string): string =>
  `--entities matched no files: ${glob}`;

/** No tree entity among the files `--entities` named. */
export const graphNoTreeMessage = (globs: readonly string[]): string =>
  `No @Tree entity matched --entities ${globs.join(", ")}; decorate an entity with @Tree, or point --entities at the file that defines it`;

/** `--table` names a table no tree entity has. */
export const graphNoTableMessage = (
  table: string,
  tables: readonly string[],
): string =>
  `No @Tree entity has table ${table}; the trees found are ${tables.join(", ")}`;

/** No `@Dag` or `@Graph` entity among the files `--entities` named. */
export const graphNoEdgeMessage = (globs: readonly string[]): string =>
  `No @Dag or @Graph entity matched --entities ${globs.join(", ")}; decorate an entity with @Dag or @Graph, or point --entities at the file that defines it`;

/** `--table` names a table no edge entity has. */
export const graphNoEdgeTableMessage = (
  table: string,
  tables: readonly string[],
): string =>
  `No @Dag or @Graph entity has table ${table}; the edge entities found are ${tables.join(", ")}`;

/** Edge entities found are of a kind the command does not draw. */
export const graphEdgeWrongKindMessage = (
  tables: readonly string[],
  command: string,
  other: string,
): string =>
  `${tables.join(", ")} ${tables.length === 1 ? "is" : "are"} not drawn by ${command}; use ${other} instead`;

/** Several edge entities match and `--table` picks none. */
export const graphSeveralEdgesMessage = (
  kinds: readonly string[],
  tables: readonly string[],
): string =>
  `Several ${kinds.join(" or ")} entities match --entities: ${tables.join(", ")}; name one with --table`;

/** Several tree entities match and `--table` does not pick one. */
export const graphSeveralTreesMessage = (tables: readonly string[]): string =>
  `Several @Tree entities match --entities: ${tables.join(", ")}; name one with --table`;

/**
 * An edge entity the command cannot read: no kind, both kinds, or a missing or
 * repeated endpoint or optional column. Its message names the class and decorator.
 */
export class GraphEdgeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = GraphEdgeError.name;
  }
}

/** Edge declarations and property names, keyed by class. */
export const graphEdgeRecords = new WeakMap<object, GraphEdgeRecord>();

/** A class that carries no `@Dag()` or `@Graph()`. */
export const graphEdgeNoKindMessage = (name: string): string =>
  `${name} is not a graph edge: mark it with @Dag() or @Graph()`;

/** A class marked with more than one of `@Dag()` and `@Graph()`. */
export const graphEdgeKindsMessage = (name: string): string =>
  `${name} declares more than one of @Dag and @Graph; keep exactly one`;

/** An edge with no property for a required endpoint decorator. */
export const graphEdgeMissingMessage = (
  name: string,
  decorator: string,
): string =>
  `${name} has no @${decorator} property; a @Dag or @Graph entity needs one`;

/** An edge with several properties for one decorator that takes one. */
export const graphEdgeSeveralMessage = (
  name: string,
  decorator: string,
  properties: readonly string[],
): string =>
  `${name} declares several @${decorator} properties (${properties.join(", ")}); keep one`;
