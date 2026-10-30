import { z } from "zod";

// ♟️ Constants

export const GITHUB_OUTPUT_VARIABLE = "GITHUB_OUTPUT";
export const PULL_REQUEST_BODY_FILE_VARIABLE = "PULL_REQUEST_BODY_FILE";
export const PULL_REQUEST_TITLE_FILE_VARIABLE = "PULL_REQUEST_TITLE_FILE";

export const MERGE_GROUP_HEAD_REF_PATTERN = /(?:^|\/)pr-([1-9]\d*)-[0-9a-f]+$/u;

export const PULL_REQUEST_CONTEXT_QUERY =
  "{number: .number, author: .user.login, title: .title, body: .body}";

export const pullRequestContextSchema = z.object({
  author: z
    .string()
    .min(1)
    .refine((author) => !/[\r\n]/u.test(author)),
  body: z.string().nullable(),
  number: z.number().int().positive(),
  title: z.string().min(1),
});
