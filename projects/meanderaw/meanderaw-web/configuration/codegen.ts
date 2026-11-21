import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * How `ID` reaches the client: as a JSON string.
 */
const scalars = {
  ID: { input: "string", output: "string" },
} as const;

/**
 * Typed documents from the API's schema.
 */
const config: CodegenConfig = {
  documents: ["src/graphql/operations/**/*.graphql"],
  generates: {
    "./src/graphql/generated/operations.ts": {
      config: { scalars, useTypeImports: true },
      plugins: ["typescript-operations", "typed-document-node"],
    },
  },
  ignoreNoDocuments: false,
  schema: "../meanderaw-api/src/schema.gql",
};

export default config;
