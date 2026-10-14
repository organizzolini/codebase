import { z } from "zod";

/**
 * The variables the publication commands read.
 *
 * Each is optional, or carries the default Nx itself uses, because a command,
 * not the application, decides which it needs and what to say when one is
 * missing — the workflows and composite actions that call these commands set
 * them per step.
 */
export const environmentSchema = z.object({
  ARGUMENTS: z.string().optional(),
  INCLUDE_SPELLING: z.string().optional(),
  INCLUDE_TEMPLATES: z.string().optional(),
  /**
   * The files to read this machine's id from, space separated, in priority
   * order. Nx reads the same two on Linux.
   */
  MACHINE_ID_FILES: z
    .string()
    .default("/var/lib/dbus/machine-id /etc/machine-id"),
  NX_BASE: z.string().optional(),
  NX_HEAD: z.string().optional(),
  /** Where Nx keeps its task-result database; the override Nx itself reads. */
  NX_WORKSPACE_DATA_DIRECTORY: z.string().default(".nx/workspace-data"),
  SPELLING_PATHS: z.string().optional(),
  TARGET: z.string().optional(),
  TEMPLATE_PATHS: z.string().optional(),
});
