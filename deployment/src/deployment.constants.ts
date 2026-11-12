import { z } from "zod";

/** Input variables read by deployment commands; each is optional. */
export const environmentSchema = z.object({
  GITHUB_ENV: z.string().optional(),
  GITHUB_OUTPUT: z.string().optional(),
  GITHUB_PACKAGES_REGISTRY: z.string().optional(),
  GITHUB_PACKAGES_TOKEN: z.string().optional(),
  GITHUB_REPOSITORY: z.string().optional(),
  GITHUB_REPOSITORY_OWNER: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
  NPM_REGISTRY: z.string().optional(),
  NPM_TOKEN: z.string().optional(),
  NX_BASE: z.string().optional(),
  NX_HEAD: z.string().optional(),
  PUSH_RETRY_DELAY: z
    .string()
    .regex(
      /^(?:\d+(?:\.\d+)?)?$/v,
      "PUSH_RETRY_DELAY must be a number of seconds",
    )
    .optional(),
  RUNNER_TEMP: z.string().optional(),
});
