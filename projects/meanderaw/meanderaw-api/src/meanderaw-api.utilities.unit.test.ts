import {
  Field,
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
  ObjectType,
  Query,
  Resolver,
} from "@nestjs/graphql";
import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { PageInfo } from "./meanderaw-api.entities";
import {
  createConnection,
  createEdge,
  fromCursor,
  Paginated,
  toCursor,
} from "./meanderaw-api.utilities";

import type { Connection } from "./meanderaw-api.types";

@ObjectType()
class TestItem {
  @Field()
  public id!: string;

  @Field()
  public name!: string;
}

const TestItemConnection = Paginated(TestItem);

@Resolver()
class TestRelayResolver {
  @Query(() => TestItemConnection)
  public testItems(): InstanceType<typeof TestItemConnection> {
    const pageInfo = new PageInfo();
    pageInfo.hasNextPage = false;
    pageInfo.hasPreviousPage = false;
    pageInfo.startCursor = "start";
    pageInfo.endCursor = "end";

    return {
      edges: [{ cursor: "cursor-1", node: { id: "1", name: "item" } }],
      pageInfo,
      totalCount: 1,
    };
  }
}

describe("relay pagination helpers suite", () => {
  describe("cursor encoding and decoding", () => {
    it("encodes and decodes an object payload", () => {
      expect.hasAssertions();

      const payload = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        score: 0.95,
      };
      const cursor = toCursor(payload);

      expect(typeof cursor).toBe("string");
      expect(fromCursor<{ id: string; score: number }>(cursor)).toStrictEqual(
        payload,
      );
    });

    it("encodes and decodes primitive values", () => {
      expect.hasAssertions();

      const numberValue = 42;
      const cursor = toCursor(numberValue);

      expect(fromCursor<number>(cursor)).toBe(numberValue);
    });

    it("encodes and decodes strings", () => {
      expect.hasAssertions();

      const text = "sample:cursor:123";
      const cursor = toCursor(text);

      expect(fromCursor<string>(cursor)).toBe(text);
    });

    it("transforms decoded payload when parser function is provided", () => {
      expect.hasAssertions();

      const cursor = toCursor({ count: 5 });
      const result = fromCursor(cursor, (value) => {
        const object_ = value as { count: number };
        return object_.count * 2;
      });

      expect(result).toBe(10);
    });
  });

  describe("paginated mixin factory", () => {
    it("generates a connection class for a given object type", () => {
      expect.hasAssertions();
      expect(TestItemConnection).toBeDefined();
      expect(typeof TestItemConnection).toBe("function");

      const ConnectionClass =
        TestItemConnection as unknown as new () => Connection<TestItem>;
      const connection: Connection<TestItem> = new ConnectionClass();
      const pageInfo = new PageInfo();
      pageInfo.hasNextPage = false;
      pageInfo.hasPreviousPage = false;
      connection.edges = [];
      connection.pageInfo = pageInfo;
      connection.totalCount = 0;

      expect(connection.totalCount).toBe(0);
      expect(connection.edges).toHaveLength(0);
    });

    it("generates GraphQL schema with relay connection and page info types", async () => {
      expect.hasAssertions();

      const { module } = await buildTestingModule(TestRelayResolver, {
        imports: [GraphQLSchemaBuilderModule],
      });

      const schemaFactory = module.get(GraphQLSchemaFactory);
      const schema = await schemaFactory.create([TestRelayResolver]);

      expect(schema).toBeDefined();
      expect(schema.getType("TestItemConnection")).toBeDefined();
      expect(schema.getType("TestItemEdge")).toBeDefined();
      expect(schema.getType("PageInfo")).toBeDefined();
      expect(schema.getQueryType()?.getFields()["testItems"]).toBeDefined();
    });
  });

  describe("page info model", () => {
    it("can be instantiated and holds pagination fields", () => {
      expect.hasAssertions();

      const pageInfo = new PageInfo();
      pageInfo.hasNextPage = true;
      pageInfo.hasPreviousPage = false;
      pageInfo.startCursor = "start-123";
      pageInfo.endCursor = "end-456";

      expect(pageInfo.hasNextPage).toBe(true);
      expect(pageInfo.hasPreviousPage).toBe(false);
      expect(pageInfo.startCursor).toBe("start-123");
      expect(pageInfo.endCursor).toBe("end-456");
    });
  });

  describe("relay factory helpers", () => {
    it("creates an edge with node and cursor", () => {
      expect.hasAssertions();

      const edge = createEdge({ id: "1" }, "cursor-1");

      expect(edge).toStrictEqual({ cursor: "cursor-1", node: { id: "1" } });
    });

    it("creates a connection with populated edges and cursor range", () => {
      expect.hasAssertions();

      const edge1 = createEdge({ id: "1" }, "cursor-1");
      const edge2 = createEdge({ id: "2" }, "cursor-2");
      const connection = createConnection({
        edges: [edge1, edge2],
        hasNextPage: true,
        hasPreviousPage: false,
        totalCount: 2,
      });

      expect(connection.edges).toHaveLength(2);
      expect(connection.pageInfo.hasNextPage).toBe(true);
      expect(connection.pageInfo.hasPreviousPage).toBe(false);
      expect(connection.pageInfo.startCursor).toBe("cursor-1");
      expect(connection.pageInfo.endCursor).toBe("cursor-2");
      expect(connection.totalCount).toBe(2);
    });

    it("creates a connection with empty edges and undefined cursors", () => {
      expect.hasAssertions();

      const connection = createConnection({
        edges: [],
        hasNextPage: false,
        hasPreviousPage: false,
        totalCount: 0,
      });

      expect(connection.edges).toHaveLength(0);
      expect(connection.pageInfo.startCursor).toBeUndefined();
      expect(connection.pageInfo.endCursor).toBeUndefined();
      expect(connection.totalCount).toBe(0);
    });
  });
});
