/** How custom scalars reach a web client: JSON strings, not classes. */
export const GRAPHQL_CODEGEN_SCALARS = {
  DateTime: { input: "string", output: "string" },
  ID: { input: "string", output: "string" },
} as const;

/** Where generated client artifacts land, relative to the codegen project. */
export const GRAPHQL_CODEGEN_GENERATED_DIRECTORY = "./src/graphql/generated";

/** Where client operations live, relative to the codegen project. */
export const GRAPHQL_CODEGEN_OPERATIONS = [
  "src/graphql/operations/**/*.graphql",
];
