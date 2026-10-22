import { z } from "zod";

// ♟️ Constants

/** One skipped step, as a line of the ledger file. */
export const failureSchema = z.object({
  exitCode: z.number(),
  label: z.string(),
  /** The end of what the step printed, which names why it failed. */
  tail: z.string(),
});
