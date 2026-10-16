import { z } from "zod";

/** Where Nx keeps its task-result database unless told otherwise. */
const DEFAULT_DATA_DIRECTORY = ".nx/workspace-data";

/** Where Nx reads the machine id from on Linux, in the order it tries them. */
const DEFAULT_MACHINE_ID_FILES = "/var/lib/dbus/machine-id /etc/machine-id";

/**
 * The variables the publication commands read.
 *
 * Each is optional, or carries the default Nx itself uses (an empty value
 * takes it too, as the shell's `${VAR:-default}` did), because a command,
 * not the application, decides which it needs and what to say when one is
 * missing — the workflows and composite actions that call these commands set
 * them per step.
 */
export const environmentSchema = z.object({
  ARGUMENTS: z.string().optional(),
  GITHUB_ENV: z.string().optional(),
  GITHUB_OUTPUT: z.string().optional(),
  GITHUB_PACKAGES_REGISTRY: z.string().optional(),
  GITHUB_PACKAGES_TOKEN: z.string().optional(),
  GITHUB_REPOSITORY: z.string().optional(),
  GITHUB_REPOSITORY_OWNER: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
  INCLUDE_SPELLING: z.string().optional(),
  INCLUDE_TEMPLATES: z.string().optional(),
  /**
   * The files to read this machine's id from, space separated, in priority
   * order. Nx reads the same two on Linux.
   */
  MACHINE_ID_FILES: z
    .string()
    .optional()
    .transform((value) => value || DEFAULT_MACHINE_ID_FILES),
  NPM_REGISTRY: z.string().optional(),
  NPM_TOKEN: z.string().optional(),
  NX_BASE: z.string().optional(),
  NX_HEAD: z.string().optional(),
  /** Where Nx keeps its task-result database; the override Nx itself reads. */
  NX_WORKSPACE_DATA_DIRECTORY: z
    .string()
    .optional()
    .transform((value) => value || DEFAULT_DATA_DIRECTORY),
  PUSH_RETRY_DELAY: z
    .string()
    .regex(
      /^(?:\d+(?:\.\d+)?)?$/v,
      "PUSH_RETRY_DELAY must be a number of seconds",
    )
    .optional(),
  RUNNER_TEMP: z.string().optional(),
  SPELLING_PATHS: z.string().optional(),
  TARGET: z.string().optional(),
  TEMPLATE_PATHS: z.string().optional(),
});
