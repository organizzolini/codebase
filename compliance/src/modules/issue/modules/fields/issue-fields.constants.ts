// ♟️ Constants

import { z } from "zod";

/** The issue field estimating the work one pull request carries. */
export const EFFORT_FIELD = {
  id: 46_460_698,
  name: "Effort",
  options: ["Low", "Medium", "High"],
} as const;

/** The issue field ordering a spec or a standalone issue. */
export const PRIORITY_FIELD = {
  id: 46_460_695,
  name: "Priority",
  options: ["Urgent", "High", "Medium", "Low"],
} as const;

/** The names of the issue fields one issue has a value for. */
export const issueFieldNamesSchema = z.array(z.string());

/** One issue's filled field names, as `gh api --jq` selects them. */
export const ISSUE_FIELD_NAMES_QUERY =
  "[.issue_field_values[].issue_field_name]";

/** Each open issue's filled field names, one JSON line per issue. */
export const OPEN_ISSUE_FIELDS_QUERY =
  ".[] | select(.pull_request == null) | {number, fieldNames: [.issue_field_values[].issue_field_name]}";

/** One line of the open-issue field listing. */
export const openIssueFieldsSchema = z.object({
  fieldNames: issueFieldNamesSchema,
  number: z.number().int().positive(),
});
