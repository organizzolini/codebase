import { z } from "zod";

/** Where Nx keeps its task-result database unless told otherwise. */
const DEFAULT_DATA_DIRECTORY = ".nx/workspace-data";

/** Where Nx keeps its task outputs unless told otherwise. */
const DEFAULT_CACHE_DIRECTORY = ".nx/cache";

/** Where Nx reads the machine id from on Linux, in the order it tries them. */
const DEFAULT_MACHINE_ID_FILES = "/var/lib/dbus/machine-id /etc/machine-id";

/**
 * The variables the integration commands read.
 *
 * Each is optional, or carries the default Nx itself uses (an empty value
 * takes it too, as the shell's `${VAR:-default}` did), because a command,
 * not the application, decides which it needs and what to say when one is
 * missing — the workflows and composite actions that call these commands set
 * them per step.
 */
export const environmentSchema = z.object({
  ARGUMENTS: z.string().optional(),
  /** A push's previous tip, `github.event.before`. */
  BEFORE: z.string().optional(),
  GITHUB_ENV: z.string().optional(),
  /** The file GitHub Actions reads step outputs from. */
  /** The event that triggered the run, such as `push` or `merge_group`. */
  GITHUB_EVENT_NAME: z.string().optional(),
  GITHUB_OUTPUT: z.string().optional(),
  /** The ref a run is for; a merge group's names the pull request. */
  GITHUB_REF: z.string().optional(),
  GITHUB_REPOSITORY: z.string().optional(),
  GITHUB_SERVER_URL: z.string().optional(),
  INCLUDE_TEMPLATES: z.string().optional(),
  /**
   * The files to read this machine's id from, space separated, in priority
   * order. Nx reads the same two on Linux.
   */
  MACHINE_ID_FILES: z
    .string()
    .optional()
    .transform((value) => value || DEFAULT_MACHINE_ID_FILES),
  NX_BASE: z.string().optional(),
  /** Where Nx keeps its task outputs; the override Nx itself reads. */
  /** Whether the job restores, and later saves, the Nx task cache: "true". */
  NX_CACHE: z.string().optional(),
  NX_CACHE_DIRECTORY: z
    .string()
    .optional()
    .transform((value) => value || DEFAULT_CACHE_DIRECTORY),
  /** The CI leg's cache scope, which names its cache artifact. */
  NX_CACHE_SCOPE: z.string().optional(),
  /** Where a push's base comes from: `last-successful` or `push-before`. */
  NX_BASE_SOURCE: z.string().optional(),
  NX_HEAD: z.string().optional(),
  /** Whether the job resolved `NX_BASE` and `NX_HEAD`: "true". */
  NX_SHAS: z.string().optional(),
  /** Where Nx keeps its task-result database; the override Nx itself reads. */
  NX_WORKSPACE_DATA_DIRECTORY: z
    .string()
    .optional()
    .transform((value) => value || DEFAULT_DATA_DIRECTORY),
  /** The pull request a report is written onto. */
  PULL_REQUEST: z.string().optional(),
  RUNNER_TEMP: z.string().optional(),
  TARGET: z.string().optional(),
});
