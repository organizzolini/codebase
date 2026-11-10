import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * How `DateTime` and `ID` reach this client: as the JSON strings they travel as.
 */
const scalars = {
  DateTime: { input: "string", output: "string" },
  ID: { input: "string", output: "string" },
} as const;

/**
 * Typed documents and MSW handlers for the operations, from the API's schema, with no extra Zod plugin.
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
