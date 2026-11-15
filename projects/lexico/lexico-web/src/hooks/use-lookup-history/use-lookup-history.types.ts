import type { lookupEntrySchema } from "./use-lookup-history.constants";
import type { z } from "zod";

// 🏷️ Types

/** A lookup the reader made, before the history stamps it. */
export type LookupDraft = Omit<LookupEntry, "recordedAt">;

/** One word lookup as the history keeps it. */
export type LookupEntry = z.infer<typeof lookupEntrySchema>;

/** What the history hook gives the reader. */
export interface UseLookupHistoryResult {
  clear: () => void;
  entries: LookupEntry[];
  record: (draft: LookupDraft) => void;
}

/** A lookup as a word card reports it, before the reader adds its text. */
export type WordLookup = Omit<LookupDraft, "slug">;
