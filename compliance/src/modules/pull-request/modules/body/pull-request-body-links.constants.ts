// ♟️ Constants

import { z } from "zod";

export const PULL_REQUEST_RELATED_HEADING = "## 🔗 Related";

export const ISSUE_REFERENCE_PATTERN = /#(?<issueNumber>[1-9]\d*)\b/gu;

export const linkedIssueNumbersSchema = z.array(z.number().int().positive());

export const issueAncestorSchema = z.object({
  body: z.string().nullable(),
  parent: z.object({ number: z.number().int().positive() }).nullable(),
});
