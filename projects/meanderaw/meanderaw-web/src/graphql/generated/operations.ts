/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** A field to sort by and a direction. */
export interface MeanderSortInput {
  /** Which way to sort. */
  direction?: SortDirection;
  /** A shape field or a characteristic key. */
  field: string;
}
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
/**
 *
 */
export interface MeandersQuery { meanders: { edges: { cursor: string, node: { characteristics: { isPattern: boolean, key: string, value: number }[]; code: string, columns: number, id: string, isHardcoded: boolean, lattice: string, repeats: number, rows: number, svg: string, } }[]; pageInfo: { endCursor: null | string, hasNextPage: boolean }, totalCount: number, } }

/**
 *
 */
export type MeandersQueryVariables = Exact<{
  after?: null | string | undefined;
  first?: null | number | undefined;
  sort?: MeanderSortInput | null | undefined;
}>;

/** The direction a sort runs. */
export type SortDirection =
  | 'ASC'
  | 'DESC';


/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends Record<string, unknown>> = { [K in keyof T]: T[K] };


export const MeandersDocument = {"definitions":[{"kind":"OperationDefinition","name":{"kind":"Name","value":"Meanders"},"operation":"query","selectionSet":{"kind":"SelectionSet","selections":[{"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"kind":"Field","name":{"kind":"Name","value":"meanders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"columns"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isHardcoded"}},{"kind":"Field","name":{"kind":"Name","value":"lattice"}},{"kind":"Field","name":{"kind":"Name","value":"repeats"}},{"kind":"Field","name":{"kind":"Name","value":"rows"}},{"kind":"Field","name":{"kind":"Name","value":"svg"}},{"kind":"Field","name":{"kind":"Name","value":"characteristics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isPattern"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]},"variableDefinitions":[{"kind":"VariableDefinition","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"VariableDefinition","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"VariableDefinition","type":{"kind":"NamedType","name":{"kind":"Name","value":"MeanderSortInput"}},"variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}]}],"kind":"Document"} as unknown as DocumentNode<MeandersQuery, MeandersQueryVariables>;