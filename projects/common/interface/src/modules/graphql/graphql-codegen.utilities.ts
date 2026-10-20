import {
  GRAPHQL_CODEGEN_GENERATED_DIRECTORY,
  GRAPHQL_CODEGEN_OPERATIONS,
  GRAPHQL_CODEGEN_SCALARS,
} from "./graphql-codegen.constants";

import type { GraphqlCodegenOptions } from "./graphql-codegen.types";
import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * The GraphQL Code Generator configuration every web client of a lexico-style
 * API shares: typed operation documents, Zod validators for their results, and
 * MSW handlers for tests. A client passes the schema its API emits.
 */
export function createGraphqlCodegenConfig(
  options: Readonly<GraphqlCodegenOptions>,
): CodegenConfig {
  const {
    documents = GRAPHQL_CODEGEN_OPERATIONS,
    generatedDirectory = GRAPHQL_CODEGEN_GENERATED_DIRECTORY,
    schema,
  } = options;

  return {
    documents,
    generates: {
      [`${generatedDirectory}/mocks.ts`]: {
        config: { useTypeImports: true },
        plugins: ["typescript", "typescript-operations", "typescript-msw"],
      },
      [`${generatedDirectory}/operations.ts`]: {
        config: { scalars: GRAPHQL_CODEGEN_SCALARS, useTypeImports: true },
        plugins: ["typescript", "typescript-operations", "typed-document-node"],
      },
      [`${generatedDirectory}/validation.ts`]: {
        config: { useTypeImports: true },
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
    schema,
  };
}
