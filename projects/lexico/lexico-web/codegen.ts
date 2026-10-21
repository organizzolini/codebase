import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  documents: ["src/graphql/operations/**/*.graphql"],
  generates: {
    "./src/graphql/generated/mocks.ts": {
      config: {
        useTypeImports: true,
      },
      plugins: ["typescript", "typescript-operations", "typescript-msw"],
    },
    "./src/graphql/generated/operations.ts": {
      config: {
        scalars: {
          DateTime: { input: "string", output: "string" },
          ID: { input: "string", output: "string" },
        },
        useTypeImports: true,
      },
      plugins: ["typescript", "typescript-operations", "typed-document-node"],
    },
    "./src/graphql/generated/validation.ts": {
      config: {
        useTypeImports: true,
      },
      plugins: [
        {
          "typescript-validation-schema": {
            importFrom: "./operations",
            schema: "zodv4",
            useTypeImports: true,
            withOperationType: true,
          },
        },
      ],
    },
  },
  ignoreNoDocuments: false,
  schema: "../lexico-api/src/schema.gql",
};

export default config;
