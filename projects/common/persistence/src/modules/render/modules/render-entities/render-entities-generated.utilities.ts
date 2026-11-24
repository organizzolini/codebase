// 🌎 Utilities

import { getMetadataArgsStorage as getMetadataArgumentsStorage } from "typeorm";

import {
  classChain,
  edgePropertiesOf,
  edgeRecordOf,
} from "./render-entities-records.utilities";
import {
  DECORATOR_OF_KIND,
  RENDER_ENTITIES_GENERATED_MARK,
  RENDER_ENTITIES_NAMING,
  RenderEntitiesEdgeError,
  renderEntitiesEdgeKindsMessage,
  renderEntitiesGeneratedBothMessage,
  renderEntitiesGeneratedCollisionMessage,
  renderEntitiesGeneratedEdges,
  renderEntitiesGeneratedKeyMessage,
  renderEntitiesGeneratedNodesMessage,
  renderEntitiesGeneratedPartialMessage,
} from "./render-entities.constants";

import type {
  GraphColumnArguments,
  GraphEdgeDeclaration,
  GraphEntity,
  GraphGeneratedContext,
  GraphGeneratedEdge,
  GraphGeneratedEndpoint,
  GraphGeneratedNames,
  GraphGeneratedOptions,
  GraphGeneratedPlan,
} from "./render-entities.types";
import type { ColumnOptions, RelationOptions } from "typeorm";

/** The edge entity `entity`, or a class it extends, generated, or is one. */
export function generatedEdgeOf(
  entity: GraphEntity,
): GraphGeneratedEdge | undefined {
  for (const target of classChain(entity)) {
    const generated = renderEntitiesGeneratedEdges.get(target);
    if (generated !== undefined) return generated;
  }
  return undefined;
}

/**
 * The names `options` carries, or `undefined` when it asks for no generation.
 * @throws RenderEntitiesEdgeError when it names the edge or the nodes alone.
 */
export function generatedNamesOf(
  options: Partial<GraphGeneratedOptions>,
  decorator: string,
): GraphGeneratedNames | undefined {
  const { edge, nodes, table } = options;
  if (edge === undefined && nodes === undefined) return undefined;
  if (edge === undefined || nodes === undefined) {
    throw new RenderEntitiesEdgeError(
      renderEntitiesGeneratedPartialMessage(
        decorator,
        edge === undefined ? "nodes" : "edge",
        edge,
      ),
    );
  }
  return { edge, nodes, ...(table === undefined ? {} : { table }) };
}

/**
 * Generates the edge entity, as `@Tree` does its closure table, and registers it with TypeORM.
 * @throws RenderEntitiesEdgeError when the entities cannot be joined.
 */
export function generateEdgeEntity(
  graph: GraphEntity,
  names: GraphGeneratedNames,
  declaration: GraphEdgeDeclaration,
): GraphGeneratedEdge {
  const context = {
    decorator: DECORATOR_OF_KIND[declaration.kind],
    edge: names.edge,
  };
  const nodes = resolveNodes(names, graph, context);
  const plan = planEdge({ context, graph, names, nodes });
  const edge = buildEdge({ declaration, graph, name: names.edge, plan });
  return rememberEdge({ edge, graph, nodes });
}

/**
 * Marks a property of the graph entity that lists the edge rows of the
 * generated entity `edge`, by the graph each belongs to.
 */
export function GraphEdges(edge: string): PropertyDecorator {
  return reverseRelation(edge, "graph", { cascade: ["insert"] });
}

/**
 * Marks a property of a node entity that lists the edge rows of the generated
 * entity `edge` that end at the node.
 */
export function GraphIncomingEdges(edge: string): PropertyDecorator {
  return reverseRelation(edge, "target");
}

/**
 * Marks a property of a node entity that lists the edge rows of the generated
 * entity `edge` that start at the node.
 */
export function GraphOutgoingEdges(edge: string): PropertyDecorator {
  return reverseRelation(edge, "source");
}

/** `entities` plus the edge, node, and graph entities of each generated edge in them, once each. */
export function withGeneratedEdges(
  entities: readonly GraphEntity[],
): GraphEntity[] {
  const listed = new Set(entities);
  const added: GraphEntity[] = [];
  for (const entity of entities) {
    const generated = generatedEdgeOf(entity);
    if (generated === undefined) continue;
    for (const extra of [generated.edge, generated.nodes, generated.graph]) {
      if (listed.has(extra)) continue;
      listed.add(extra);
      added.push(extra);
    }
  }
  return [...entities, ...added];
}

/**
 * Passes unless the edge's name or table is one an entity already has.
 * @throws RenderEntitiesEdgeError when it collides.
 */
function assertNoCollision(
  graph: GraphEntity,
  context: GraphGeneratedContext,
  table: string,
): void {
  const taken = getMetadataArgumentsStorage().tables.some((registered) => {
    const name =
      typeof registered.target === "function"
        ? registered.target.name
        : registered.target;
    return (
      name === context.edge ||
      RENDER_ENTITIES_NAMING.tableName(name, registered.name) === table
    );
  });
  if (taken) {
    throw new RenderEntitiesEdgeError(
      renderEntitiesGeneratedCollisionMessage(context, graph.name),
    );
  }
}

/**
 * Passes unless `graph` marks endpoints of its own, which a generated edge replaces.
 * @throws RenderEntitiesEdgeError naming the first marked role.
 */
function assertOwnEndpointsUnmarked(graph: GraphEntity, edge: string): void {
  for (const role of ["GraphSource", "GraphTarget"] as const) {
    if (edgePropertiesOf(graph, role).length > 0) {
      throw new RenderEntitiesEdgeError(
        renderEntitiesGeneratedBothMessage(graph.name, edge, role),
      );
    }
  }
}

/**
 * Passes unless `graph` already generated an edge, so it declares two.
 * @throws RenderEntitiesEdgeError when it did.
 */
function assertSingleGeneration(graph: GraphEntity): void {
  if (renderEntitiesGeneratedEdges.has(graph)) {
    throw new RenderEntitiesEdgeError(
      renderEntitiesEdgeKindsMessage(graph.name),
    );
  }
}

/** Makes the class, registers it with TypeORM and the edge records, and returns it. */
function buildEdge({
  declaration,
  graph,
  name,
  plan: { endpoints, table, tableOption },
}: {
  readonly declaration: GraphEdgeDeclaration;
  readonly graph: GraphEntity;
  readonly name: string;
  readonly plan: GraphGeneratedPlan;
}): GraphEntity {
  const edge = namedClass(name, graph);
  registerEdge(edge, endpoints, tableOption);
  registerIndices(edge, endpoints, table);
  recordEdge(edge, endpoints, declaration);
  return edge;
}

/** The options of a key that a column typed from it must keep. */
function copiedKeyOptions(source: ColumnOptions): ColumnOptions {
  return {
    ...(source.type === undefined ? {} : { type: source.type }),
    ...(source.enum === undefined ? {} : { enum: source.enum }),
    ...(source.transformer === undefined
      ? {}
      : { transformer: source.transformer }),
    ...(source.length === undefined ? {} : { length: source.length }),
    ...(source.precision === undefined ? {} : { precision: source.precision }),
    ...(source.scale === undefined ? {} : { scale: source.scale }),
    ...(source.unsigned === undefined ? {} : { unsigned: source.unsigned }),
  };
}

/**
 * Drops what an earlier run of this graph's decorator registered for the same
 * edge name, as when a test reloads the module.
 */
function discardStaleEdge(edge: string, graph: GraphEntity): void {
  const storage = getMetadataArgumentsStorage();
  const stale = new Set<unknown>();
  for (const { target } of storage.tables) {
    if (
      typeof target === "function" &&
      target.name === edge &&
      Reflect.get(target, RENDER_ENTITIES_GENERATED_MARK) === graph.name
    ) {
      stale.add(target);
    }
  }
  for (const list of [
    storage.tables,
    storage.columns,
    storage.relations,
    storage.joinColumns,
    storage.indices,
  ]) {
    for (let index = list.length - 1; index >= 0; index -= 1) {
      if (stale.has(list[index]?.target)) list.splice(index, 1);
    }
  }
}

/** The graph's, source's, and target's columns, in that order, each typed from the key it references. */
function edgeEndpoints(
  graph: GraphEntity,
  nodes: GraphEntity,
  context: GraphGeneratedContext,
): [GraphGeneratedEndpoint, GraphGeneratedEndpoint, GraphGeneratedEndpoint] {
  const graphKey = singleKey(graph, context);
  const nodeKey = singleKey(nodes, context);
  return [
    endpointOf(["graph", graph, graphKey], lowerFirst(graph.name)),
    endpointOf(["source", nodes, nodeKey], "from"),
    endpointOf(["target", nodes, nodeKey], "to"),
  ];
}

/** The column `prefix` and `key` name, joined to `target` by the relation `relation`. */
function endpointOf(
  [relation, target, key]: readonly [string, GraphEntity, GraphColumnArguments],
  prefix: string,
): GraphGeneratedEndpoint {
  const property = `${prefix}${upperFirst(key.propertyName)}`;
  return {
    column: RENDER_ENTITIES_NAMING.columnName(property, key.options.name, []),
    key,
    property,
    relation,
    target,
  };
}

/** `text` with its first letter in lower case. */
function lowerFirst(text: string): string {
  return `${text.charAt(0).toLowerCase()}${text.slice(1)}`;
}

/**
 * An empty class named `name`, marked with the name of the graph that
 * generated it.
 */
function namedClass(name: string, graph: GraphEntity): GraphEntity {
  const created = class extends Object {};
  Object.defineProperty(created, "name", { value: name });
  Object.defineProperty(created, RENDER_ENTITIES_GENERATED_MARK, {
    value: graph.name,
  });
  return created;
}

/**
 * Checks the entities can be joined, then names the edge's columns and table.
 * @throws RenderEntitiesEdgeError when they cannot.
 */
function planEdge({
  context,
  graph,
  names,
  nodes,
}: {
  readonly context: GraphGeneratedContext;
  readonly graph: GraphEntity;
  readonly names: GraphGeneratedNames;
  readonly nodes: GraphEntity;
}): GraphGeneratedPlan {
  assertSingleGeneration(graph);
  assertOwnEndpointsUnmarked(graph, context.edge);
  const endpoints = edgeEndpoints(graph, nodes, context);
  const table = RENDER_ENTITIES_NAMING.tableName(names.edge, names.table);
  discardStaleEdge(names.edge, graph);
  assertNoCollision(graph, context, table);
  return { endpoints, table, tableOption: names.table };
}

/** Records the declaration and the roles the generated columns play, as decorators on a hand-written edge would. */
function recordEdge(
  edge: GraphEntity,
  [graphEnd, sourceEnd, targetEnd]: readonly [
    GraphGeneratedEndpoint,
    GraphGeneratedEndpoint,
    GraphGeneratedEndpoint,
  ],
  declaration: GraphEdgeDeclaration,
): void {
  const record = edgeRecordOf(edge);
  record.declarations.push(declaration);
  record.properties.GraphLabel.push(graphEnd.property);
  record.properties.GraphSource.push(sourceEnd.property);
  record.properties.GraphTarget.push(targetEnd.property);
}

/**
 * Registers the edge's table, key columns, and cascading relations with
 * TypeORM, as its own decorators would for a class written by hand.
 */
function registerEdge(
  edge: GraphEntity,
  endpoints: readonly GraphGeneratedEndpoint[],
  table: string | undefined,
): void {
  const storage = getMetadataArgumentsStorage();
  storage.tables.push({
    target: edge,
    type: "regular",
    ...(table === undefined ? {} : { name: table }),
  });
  for (const end of endpoints) {
    storage.columns.push({
      mode: "regular",
      options: {
        ...copiedKeyOptions(end.key.options),
        name: end.column,
        primary: true,
      },
      propertyName: end.property,
      target: edge,
    });
    storage.relations.push({
      isLazy: false,
      options: { onDelete: "CASCADE" },
      propertyName: end.relation,
      relationType: "many-to-one",
      target: edge,
      type: () => end.target,
    });
    storage.joinColumns.push({
      name: end.column,
      propertyName: end.relation,
      target: edge,
    });
  }
}

/** Registers an index on each end, named for the table and the end's key column. */
function registerIndices(
  edge: GraphEntity,
  [, source, target]: readonly [
    GraphGeneratedEndpoint,
    GraphGeneratedEndpoint,
    GraphGeneratedEndpoint,
  ],
  table: string,
): void {
  const storage = getMetadataArgumentsStorage();
  for (const [role, end] of [
    ["from", source],
    ["to", target],
  ] as const) {
    const key = RENDER_ENTITIES_NAMING.columnName(
      end.key.propertyName,
      end.key.options.name,
      [],
    );
    storage.indices.push({
      columns: [end.property],
      name: `${table}_${role}_${key}`,
      target: edge,
    });
  }
}

/** Remembers the generated edge under the graph and under itself, so either finds it. */
function rememberEdge(generated: GraphGeneratedEdge): GraphGeneratedEdge {
  renderEntitiesGeneratedEdges.set(generated.graph, generated);
  renderEntitiesGeneratedEdges.set(generated.edge, generated);
  return generated;
}

/** The entity `names.nodes` returns, read when the decorator runs. */
function resolveNodes(
  names: GraphGeneratedNames,
  graph: GraphEntity,
  context: GraphGeneratedContext,
): GraphEntity {
  try {
    return names.nodes();
  } catch (error) {
    throw new RenderEntitiesEdgeError(
      renderEntitiesGeneratedNodesMessage(
        context,
        graph.name,
        error instanceof Error ? error.message : String(error),
      ),
    );
  }
}

/** Registers the one-to-many side of edge `edge`'s `inverse` relation by name, as its class does not yet exist. */
function reverseRelation(
  edge: string,
  inverse: "graph" | "source" | "target",
  options: RelationOptions = {},
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    getMetadataArgumentsStorage().relations.push({
      inverseSideProperty: inverse,
      isLazy: false,
      options,
      propertyName: String(propertyKey),
      relationType: "one-to-many",
      target: target.constructor,
      type: edge,
    });
  };
}

/**
 * The one primary column `entity` has, declared or inherited.
 * @throws RenderEntitiesEdgeError when it has none, or several.
 */
function singleKey(
  entity: GraphEntity,
  context: GraphGeneratedContext,
): GraphColumnArguments {
  const keys = new Map<string, GraphColumnArguments>();
  const chain = new Set<unknown>(classChain(entity));
  for (const column of getMetadataArgumentsStorage().columns) {
    if (!chain.has(column.target)) continue;
    if (column.options.primary === true && !keys.has(column.propertyName)) {
      keys.set(column.propertyName, column);
    }
  }
  const [only, ...others] = keys.values();
  if (only === undefined || others.length > 0) {
    throw new RenderEntitiesEdgeError(
      renderEntitiesGeneratedKeyMessage(context, entity.name, keys.size),
    );
  }
  return only;
}

/** `text` with its first letter in upper case. */
function upperFirst(text: string): string {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}
