/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
/** How a filter group joins the rules and groups in it. */
export type MeanderFilterCombinator =
  | 'AND'
  | 'OR';

/** Rules and nested groups under one combinator. */
export type MeanderFilterGroupInput = {
  /** How the rules and groups are joined. */
  combinator: MeanderFilterCombinator;
  /** The groups nested in this one. */
  groups?: Array<MeanderFilterGroupInput> | null | undefined;
  /** The rules of this group. */
  rules?: Array<MeanderFilterRuleInput> | null | undefined;
};

/** How a rule compares; a missing value reads as 0 or false. */
export type MeanderFilterOperator =
  | 'BETWEEN'
  | 'EQ'
  | 'GT'
  | 'GTE'
  | 'IS'
  | 'IS_NOT'
  | 'LT'
  | 'LTE'
  | 'NE';

/** A field, an operator and the value it compares. */
export type MeanderFilterRuleInput = {
  /** A shape field (rows, columns, lattice, repeats, isHardcoded) or a characteristic key. */
  field: string;
  /** What is and is_not compare with, for a boolean field. */
  flag?: boolean | null | undefined;
  /** The number a comparison uses, or the two ends of a between, low first. */
  numbers?: Array<number> | null | undefined;
  /** How to compare. */
  operator: MeanderFilterOperator;
  /** What eq and ne compare with, for the lattice. */
  text?: string | null | undefined;
};

/** One level to group meanders by. */
export type MeanderGroupLevelInput = {
  /** rows, columns, rowsColumns, lattice, isHardcoded or a characteristic key. */
  field: string;
};

/** A field to sort by and a direction. */
export type MeanderSortInput = {
  /** Which way to sort. */
  direction?: SortDirection;
  /** A shape field or a characteristic key. */
  field: string;
};

/** The direction a sort runs. */
export type SortDirection =
  | 'ASC'
  | 'DESC';

export type CharacteristicsQueryVariables = Exact<{ [key: string]: never; }>;


export type CharacteristicsQuery = { characteristics: Array<{ category: string, description: string, isPattern: boolean, key: string, meanderCount: number, name: string, valueType: string, valueCounts: Array<{ meanderCount: number, value: number }> }> };

export type MeanderGroupsQueryVariables = Exact<{
  filter?: MeanderFilterGroupInput | null | undefined;
  groupBy: Array<MeanderGroupLevelInput> | MeanderGroupLevelInput;
}>;


export type MeanderGroupsQuery = { meanderGroups: Array<{ count: number, field: string, value: string, groups: Array<{ count: number, field: string, value: string, groups: Array<{ count: number, field: string, value: string, groups: Array<{ count: number, field: string, value: string }> }> }> }> };

export type MeandersQueryVariables = Exact<{
  first?: number | null | undefined;
  after?: string | null | undefined;
  offset?: number | null | undefined;
  sort?: Array<MeanderSortInput> | MeanderSortInput | null | undefined;
  filter?: MeanderFilterGroupInput | null | undefined;
  repeats?: number | null | undefined;
}>;


export type MeandersQuery = { meanders: { totalCount: number, pageInfo: { endCursor: string | null, hasNextPage: boolean }, edges: Array<{ cursor: string, node: { code: string, columns: number, id: string, isHardcoded: boolean, lattice: string, repeats: number, rows: number, svg: string, characteristics: Array<{ isPattern: boolean, key: string, name: string, value: number }> } }> } };


export const CharacteristicsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Characteristics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characteristics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"isPattern"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"meanderCount"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"valueCounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"meanderCount"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"valueType"}}]}}]}}]} as unknown as DocumentNode<CharacteristicsQuery, CharacteristicsQueryVariables>;
export const MeanderGroupsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MeanderGroups"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"MeanderFilterGroupInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"groupBy"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MeanderGroupLevelInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"meanderGroups"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"groupBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"groupBy"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<MeanderGroupsQuery, MeanderGroupsQueryVariables>;
export const MeandersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Meanders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MeanderSortInput"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"MeanderFilterGroupInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"repeats"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"meanders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"columns"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isHardcoded"}},{"kind":"Field","name":{"kind":"Name","value":"lattice"}},{"kind":"Field","name":{"kind":"Name","value":"repeats"}},{"kind":"Field","name":{"kind":"Name","value":"rows"}},{"kind":"Field","name":{"kind":"Name","value":"svg"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"repeats"},"value":{"kind":"Variable","name":{"kind":"Name","value":"repeats"}}}]},{"kind":"Field","name":{"kind":"Name","value":"characteristics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isPattern"}},{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<MeandersQuery, MeandersQueryVariables>;