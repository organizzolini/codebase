import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * How `DateTime` and `ID` reach the client: as JSON strings.
 */
const scalars = {
  DateTime: { input: "string", output: "string" },
  ID: { input: "string", output: "string" },
} as const;

/**
 * Typed documents and MSW handlers from the API's schema.
 */
const config: CodegenConfig = {
  documents: ["src/graphql/operations/**/*.graphql"],
  generates: {
    "./src/graphql/generated/mocks.ts": {
      config: { scalars, useTypeImports: true },
      plugins: ["typescript-operations", "typescript-msw"],
    },
    "./src/graphql/generated/operations.ts": {
      config: { scalars, useTypeImports: true },
      plugins: ["typescript-operations", "typed-document-node"],
    },
  },
  ignoreNoDocuments: false,
  schema: "../caelundas-api/src/schema.gql",
};

export default config;
