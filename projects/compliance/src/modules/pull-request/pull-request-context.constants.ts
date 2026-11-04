import { z } from "zod";

// ♟️ Constants

export const GITHUB_OUTPUT_VARIABLE = "GITHUB_OUTPUT";

export const PULL_REQUEST_NUMBER_PATTERN = /^[1-9]\d*$/u;

export const MERGE_GROUP_HEAD_REF_PATTERN = /(?:^|\/)pr-([1-9]\d*)-[0-9a-f]+$/u;

export const PULL_REQUEST_CONTEXT_QUERY =
  "{number: .number, author: .user.login, title: .title, body: .body, draft: .draft, labels: [.labels[].name], assignees: [.assignees[].login]}";

export const pullRequestContextSchema = z.object({
  assignees: z.array(z.string()),
  author: z
    .string()
    .min(1)
    .refine((author) => !/[\r\n]/u.test(author)),
  body: z.string().nullable(),
  draft: z.boolean(),
  labels: z.array(z.string()),
  number: z.number().int().positive(),
  title: z.string().min(1),
});
