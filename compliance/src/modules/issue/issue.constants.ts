// ♟️ Constants

import { z } from "zod";

/** The workflow event that carries one issue. */
export const ISSUES_EVENT = "issues";

/** The action of the event that files a new issue. */
export const ISSUE_OPENED_ACTION = "opened";

/** The workflow events that sweep every open issue instead of one. */
export const SWEEP_EVENTS: readonly string[] = [
  "schedule",
  "workflow_dispatch",
];

/** The argument that lets a local run write, as in `issue 12 write`. */
export const WRITE_ARGUMENT = "write";

/** What the command prints when it cannot tell what to do. */
export const USAGE_LINES = [
  "Usage: compliance issue <issue-number> [write]",
  "   or: compliance issue --all [write]",
  "   or: GITHUB_EVENT_NAME=issues ISSUE_NUMBER=… compliance issue",
];

/** The labels an `issues` event carries: names, or objects that have one. */
export const issueLabelsSchema = z.array(
  z.union([z.string(), z.object({ name: z.string() })]),
);

/** The assignees an `issues` event carries; only how many matters. */
export const issueAssigneesSchema = z.array(z.unknown());
