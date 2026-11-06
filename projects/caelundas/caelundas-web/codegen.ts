import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * How `DateTime` and `ID` reach this client: as the strings they travel as in
 * JSON, not the `Date` or opaque id their server-side classes hold.
 */
const scalars = {
  DateTime: { input: "string", output: "string" },
  ID: { input: "string", output: "string" },
} as const;

/**
 * Typed documents and MSW handlers for the operations in `src/graphql/`,
 * from the schema `caelundas-api` emits.
 *
 * Unlike `lexico-web`, this does not run the `typescript` plugin or the Zod
 * validation plugin beside `typescript-operations`: operations here take enum
 * and input variables, so `typescript-operations` already declares the schema
 * types they name, and a second declaration of each would not compile. The
 * filter input is also recursive, which the validation plugin cannot express
 * under `exactOptionalPropertyTypes`.
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
