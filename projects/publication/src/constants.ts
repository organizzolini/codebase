import { z } from "zod";

/**
 * The variables the publication commands read.
 *
 * Each is optional because a command, not the application, decides which it
 * needs and what to say when one is missing — the workflows and composite
 * actions that call these commands set them per step.
 */
export const environmentSchema = z.object({
  ARGUMENTS: z.string().optional(),
  INCLUDE_SPELLING: z.string().optional(),
  NX_BASE: z.string().optional(),
  NX_HEAD: z.string().optional(),
  SPELLING_PATHS: z.string().optional(),
  TARGET: z.string().optional(),
});

/** The validated shape of the environment the commands read. */
export type Environment = z.infer<typeof environmentSchema>;
