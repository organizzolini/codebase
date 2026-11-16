import { describe, expect, it } from "vitest";

import { createGraphqlCodegenConfig } from "./graphql-client.utilities";

describe("graphql codegen configuration suite", () => {
  it("generates operations, validators, and mocks beside each other", () => {
    expect.hasAssertions();

    const config = createGraphqlCodegenConfig({ schema: "../api/schema.gql" });

    expect(config.schema).toBe("../api/schema.gql");
    expect(config.documents).toStrictEqual([
      "src/graphql/operations/**/*.graphql",
    ]);
    expect(Object.keys(config.generates)).toStrictEqual([
      "./src/graphql/generated/mocks.ts",
      "./src/graphql/generated/operations.ts",
      "./src/graphql/generated/validation.ts",
    ]);
  });

  it("leaves the validators out when a client opts out of them", () => {
    expect.hasAssertions();

    const config = createGraphqlCodegenConfig({
      schema: "schema.gql",
      validators: false,
    });

    expect(Object.keys(config.generates)).toStrictEqual([
      "./src/graphql/generated/mocks.ts",
      "./src/graphql/generated/operations.ts",
    ]);
  });

  it("types the scalars a client reads as strings", () => {
    expect.hasAssertions();

    const config = createGraphqlCodegenConfig({ schema: "schema.gql" });
    const operations =
      config.generates["./src/graphql/generated/operations.ts"];

    expect(operations).toMatchObject({
      config: {
        scalars: {
          DateTime: { input: "string", output: "string" },
          ID: { input: "string", output: "string" },
        },
      },
    });
  });

  it("lets a client move its operations and its output", () => {
    expect.hasAssertions();

    const config = createGraphqlCodegenConfig({
      documents: ["queries/**/*.graphql"],
      generatedDirectory: "./gen",
      schema: "schema.gql",
    });

    expect(config.documents).toStrictEqual(["queries/**/*.graphql"]);
    expect(Object.keys(config.generates)).toStrictEqual([
      "./gen/mocks.ts",
      "./gen/operations.ts",
      "./gen/validation.ts",
    ]);
  });

  it("declares each schema enum once per file that also emits the schema", () => {
    expect.hasAssertions();

    const config = createGraphqlCodegenConfig({ schema: "schema.gql" });

    expect(config.generates["./src/graphql/generated/mocks.ts"]).toMatchObject({
      config: { importSchemaTypesFrom: "./src/graphql/generated/mocks" },
    });
    expect(
      config.generates["./src/graphql/generated/operations.ts"],
    ).toMatchObject({
      config: { importSchemaTypesFrom: "./src/graphql/generated/operations" },
    });
  });
});
