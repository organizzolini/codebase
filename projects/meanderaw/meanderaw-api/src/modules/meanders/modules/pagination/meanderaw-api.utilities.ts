import { Field, Int, ObjectType } from "@nestjs/graphql";

import { PageInfo } from "./meanderaw-api.entities";

import type { ClassConstructor, Connection, Edge } from "./meanderaw-api.types";

/**
 * Creates a Relay Connection containing edges, page info, and total count.
 */
export function createConnection<T>(parameters: {
  edges: Edge<T>[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
}): Connection<T> {
  const pageInfo = new PageInfo();
  pageInfo.hasNextPage = parameters.hasNextPage;
  pageInfo.hasPreviousPage = parameters.hasPreviousPage;
  pageInfo.startCursor =
    parameters.edges.length > 0 ? parameters.edges[0]?.cursor : undefined;
  pageInfo.endCursor =
    parameters.edges.length > 0 ? parameters.edges.at(-1)?.cursor : undefined;

  return {
    edges: parameters.edges,
    pageInfo,
    totalCount: parameters.totalCount,
  };
}

/**
 * Creates a Relay Edge from a node and an encoded cursor string.
 */
export function createEdge<T>(node: T, cursor: string): Edge<T> {
  return { cursor, node };
}

/**
 * Mixin type factory producing a Relay Edge ObjectType for GraphQL schema generation.
 */
export function createEdgeType<T>(
  classReference: ClassConstructor<T>,
): ClassConstructor<Edge<T>> {
  const EdgeType = class implements Edge<T> {
    public cursor!: string;
    public node!: T;
  };

  const prototype: Edge<T> = new EdgeType();

  Field(() => String, { description: "A cursor for use in pagination." })(
    prototype,
    "cursor",
  );
  Field(() => classReference, {
    description: "The item at the end of the edge.",
  })(prototype, "node");
  ObjectType(`${classReference.name}Edge`)(EdgeType);

  return EdgeType;
}

/**
 * Decodes an opaque Base64 cursor string into structured data.
 */
export function fromCursor<T = unknown>(
  cursor: string,
  parse?: (value: unknown) => T,
): T {
  const jsonString = Buffer.from(cursor, "base64url").toString("utf8");
  if (parse !== undefined) {
    return parse(JSON.parse(jsonString));
  }
  return JSON.parse(jsonString) as T;
}

/**
 * Mixin type factory producing a Relay Connection ObjectType for GraphQL schema generation.
 */
export function Paginated<T>(
  classReference: ClassConstructor<T>,
): ClassConstructor<Connection<T>> {
  const EdgeType = createEdgeType(classReference);

  /**
   * Relay Connection GraphQL object type.
   */
  @ObjectType(`${classReference.name}Connection`)
  abstract class ConnectionType implements Connection<T> {
    @Field(() => [EdgeType], { description: "A list of edges." })
    public edges!: Edge<T>[];

    @Field(() => PageInfo, { description: "Information to aid in pagination." })
    public pageInfo!: PageInfo;

    @Field(() => Int, {
      description: "Identifies the total count of items in the connection.",
    })
    public totalCount!: number;
  }

  return ConnectionType;
}

/**
 * Encodes structured data into an opaque Base64 cursor string.
 */
export function toCursor(data: unknown): string {
  return Buffer.from(JSON.stringify(data), "utf8").toString("base64url");
}
