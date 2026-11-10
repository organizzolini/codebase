/**
 * How each custom scalar reaches a web client: the JSON string it travels as,
 * not the server's `Date` or id class.
 */
export const GRAPHQL_CODEGEN_SCALARS = {
  DateTime: { input: "string", output: "string" },
  ID: { input: "string", output: "string" },
} as const;

/**
 * Where a client's generated artifacts land, relative to the project that
 * runs code generation.
 */
export const GRAPHQL_CODEGEN_GENERATED_DIRECTORY = "./src/graphql/generated";

/**
 * Where a client keeps the operations it generates types for, relative to the
 * project that runs code generation.
 */
export const GRAPHQL_CODEGEN_OPERATIONS = [
  "src/graphql/operations/**/*.graphql",
];
