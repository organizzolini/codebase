import os from "node:os";
import path from "node:path";

import { z } from "zod";

/** Where Nx keeps its task-result database unless told otherwise. */
const DEFAULT_DATA_DIRECTORY = ".nx/workspace-data";

/** Where a best-effort run records the steps it skipped, unless told otherwise. */
const DEFAULT_BEST_EFFORT_REPORT = path.join(
  os.tmpdir(),
  "best-effort-report.jsonl",
);

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
  /** The step's name, as the pull request will list it when it is skipped. */
  BEST_EFFORT_LABEL: z.string().optional(),
  /** The files the step may change, space or newline separated. */
  BEST_EFFORT_PATHS: z.string().optional(),
  /** A script that puts the environment back after a skipped step. */
  BEST_EFFORT_RECOVER: z.string().optional(),
  /** The file the skipped steps are recorded in, one JSON object a line. */
  BEST_EFFORT_REPORT: z
    .string()
    .optional()
    .transform((value) => value || DEFAULT_BEST_EFFORT_REPORT),
  /** The script that does the step's work. */
  BEST_EFFORT_RUN: z.string().optional(),
  /** The file GitHub Actions reads step outputs from. */
  GITHUB_OUTPUT: z.string().optional(),
  /** The file GitHub Actions renders as the job's summary. */
  GITHUB_STEP_SUMMARY: z.string().optional(),
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
  NX_BASE: z.string().optional(),
  NX_HEAD: z.string().optional(),
  /** Where Nx keeps its task-result database; the override Nx itself reads. */
  NX_WORKSPACE_DATA_DIRECTORY: z
    .string()
    .optional()
    .transform((value) => value || DEFAULT_DATA_DIRECTORY),
  SPELLING_PATHS: z.string().optional(),
  TARGET: z.string().optional(),
  TEMPLATE_PATHS: z.string().optional(),
});
