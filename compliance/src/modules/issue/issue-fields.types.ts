// 🏷️ Types

import type { IssueMetadata } from "./issue-metadata.types";

/** An organization issue field a compliance check requires. */
export interface IssueField {
  readonly id: number;
  readonly name: string;
  readonly options: readonly string[];
}

/** What the Priority rule reads off an issue. */
export type IssueFieldFacts = Pick<IssueMetadata, "fieldNames" | "hasParent">;

/** One issue's filled field names, or why they cannot be read. */
export interface IssueFieldNamesResult {
  readonly error?: string;
  readonly fieldNames?: readonly string[];
  readonly success: boolean;
}

/** The issue a field rule judges, and the fields it has filled. */
export interface IssueFieldTarget {
  readonly fieldNames: readonly string[];
  readonly issueNumber: string;
}

/** Every open issue's filled field names by number, or why not. */
export type OpenIssueFieldNamesResult =
  | { readonly error: string; readonly success: false }
  | {
      readonly fieldNames: ReadonlyMap<number, readonly string[]>;
      readonly success: true;
    };
