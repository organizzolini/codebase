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

/** Said when a pull request closes no issue at all. */
export const NO_LINKED_ISSUE_MESSAGE =
  "❌ No issue is closed by this pull request. Add a `Closes #<issue>` bullet to the 🔗 Related section.";

/** The names of the issue fields one issue has a value for. */
export const issueFieldNamesSchema = z.array(z.string());
