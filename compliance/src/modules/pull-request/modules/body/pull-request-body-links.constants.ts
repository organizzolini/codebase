// ♟️ Constants

import { z } from "zod";

export const PULL_REQUEST_RELATED_HEADING = "## 🔗 Related";

export const ISSUE_REFERENCE_PATTERN = /#(?<issueNumber>[1-9]\d*)\b/gu;

/** A closing keyword GitHub honors, then the same-repository issue it closes. */
export const CLOSING_REFERENCE_PATTERN =
  /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?):?\s+#(?<issueNumber>[1-9]\d*)\b/giu;

export const issueAncestorSchema = z.object({
  body: z.string().nullable(),
  parent: z.object({ number: z.number().int().positive() }).nullable(),
});
