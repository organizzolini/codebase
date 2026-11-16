// 🏷️ Types

/** An organization issue field the linked-issue check requires. */
export interface IssueField {
  readonly id: number;
  readonly name: string;
  readonly options: readonly string[];
}

/** One issue as the linked-issue check reads it. */
export interface LinkedIssue {
  /** Its `gh issue view` document, for the issue audit to read. */
  readonly document: string;
  /** The names of the issue fields that hold a value. */
  readonly fieldNames: readonly string[];
  readonly number: number;
  readonly parentNumber?: number;
}

/** The issues one linked-issue check has read, and where its findings go. */
export interface LinkedIssuesRun {
  readonly issues: Map<number, LinkedIssue>;
  readonly linkedNumbers: readonly number[];
  /** Records one failure and the commands that fix it. */
  readonly record: (failure: string, ...commands: string[]) => void;
}
