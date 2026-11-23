import type {
  historyEntrySchema,
  lookupEntrySchema,
  searchEntrySchema,
  textEntrySchema,
} from "./use-lookup-history.constants";
import type * as z from "zod/mini";

// 🏷️ Types

/** One history entry: a lookup, a search, or a text opening. */
export type HistoryEntry = z.infer<typeof historyEntrySchema>;

/** A lookup the reader made, before the history stamps it. */
export type LookupDraft = Omit<LookupEntry, "kind" | "recordedAt">;

/** One word lookup as the history keeps it. */
export type LookupEntry = z.infer<typeof lookupEntrySchema>;

/** A search the search page made, before the history stamps it. */
export type SearchDraft = Omit<SearchEntry, "kind" | "recordedAt">;

/** One dictionary search as the history keeps it. */
export type SearchEntry = z.infer<typeof searchEntrySchema>;

/** A text opening the reader made, before the history stamps it. */
export type TextDraft = Omit<TextEntry, "kind" | "recordedAt">;

/** One opening of a text as the history keeps it. */
export type TextEntry = z.infer<typeof textEntrySchema>;

/** What the history hook gives the reader. */
export interface UseLookupHistoryResult {
  clear: () => void;
  entries: HistoryEntry[];
  record: (draft: LookupDraft) => void;
  recordSearch: (query: string) => void;
  recordText: (draft: TextDraft) => void;
}

/** A lookup as a word card reports it, before the reader adds its text. */
export type WordLookup = Omit<LookupDraft, "slug" | "title">;
