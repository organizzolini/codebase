import {
  GRAPHQL_CODEGEN_GENERATED_DIRECTORY,
  GRAPHQL_CODEGEN_OPERATIONS,
  GRAPHQL_CODEGEN_SCALARS,
} from "./graphql-client.constants";

import type { GraphqlCodegenOptions } from "./graphql-client.types";
import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * Code generator configuration shared by web clients: typed operations, Zod
 * validators, and MSW handlers. A client passes its API's schema.
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
