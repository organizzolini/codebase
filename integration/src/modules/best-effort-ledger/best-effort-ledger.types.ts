// 🏷️ Types
import type { failureSchema } from "./best-effort-ledger.constants";
import type { z } from "zod";

/** A step that failed and was skipped. */
export type BestEffortFailure = z.infer<typeof failureSchema>;
