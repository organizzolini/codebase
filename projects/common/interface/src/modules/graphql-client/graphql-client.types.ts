/**
 * What one client says about its code generation; everything else is shared.
 */
export interface GraphqlCodegenOptions {
  /** Operation documents to generate types for, over the shared default. */
  documents?: string[];
  /** Where the generated artifacts land, over the shared default. */
  generatedDirectory?: string;
  /** The schema file the API emits, relative to the project. */
  schema: string;
  /**
   * Whether to emit Zod validators, which default to on. Nested input objects
   * generate schemas that fail typecheck under exactOptionalPropertyTypes.
   */
  validators?: boolean;
}
