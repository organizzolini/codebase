// ♟️ Constants

import { z } from "zod";

/** The client every GitHub API call goes through. */
export const GITHUB_CLI_BINARY = "gh";

/** The account that owns unassigned issues in this repository. */
export const DEFAULT_ISSUE_ASSIGNEE = "JimmyPaolini";

/** A positive decimal issue number. */
export const ISSUE_NUMBER_PATTERN = /^[1-9]\d*$/u;

/** The open issue pages with only fields needed by the assignment sweep. */
export const OPEN_ISSUES_ENDPOINT =
  "repos/{owner}/{repo}/issues?state=open&per_page=100";
export const OPEN_ISSUES_QUERY = "add | map({number, pull_request, assignees})";

/** The shape returned by the paginated, reduced issue query. */
export const openIssueSummariesSchema = z.array(
  z.object({
    assignees: z.array(z.object({ login: z.string() })),
    number: z.number().int().positive(),
    pull_request: z.unknown().nullable().optional(),
  }),
);
