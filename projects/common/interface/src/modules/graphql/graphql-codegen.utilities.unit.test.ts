import { describe, expect, it } from "vitest";

import { createGraphqlCodegenConfig } from "./graphql-codegen.utilities";

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
});
