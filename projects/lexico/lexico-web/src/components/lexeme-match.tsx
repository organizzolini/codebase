import {
  Equal,
  Landmark,
  Languages,
  ListStart,
  ScanSearch,
  TextSearch,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@codebase/presentation";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// ♟️ Constants

/**
 * The language of the word a search matched, as an icon and what it says.
 */
const LANGUAGES: Readonly<
  Record<"english" | "latin", { hint: string; icon: LucideIcon; label: string }>
> = {
  english: {
    hint: "Matched an English translation",
    icon: Languages,
    label: "English match",
  },
  latin: {
    hint: "Matched a Latin word",
    icon: Landmark,
    label: "Latin match",
  },
};

/**
 * How closely the word matched what was searched, as an icon and what it says.
 */
const TYPES: Readonly<
  Record<
    "contains" | "exact" | "fuzzy" | "starts-with",
    { icon: LucideIcon; label: string }
  >
> = {
  contains: { icon: TextSearch, label: "Contains" },
  exact: { icon: Equal, label: "Exact match" },
  fuzzy: { icon: ScanSearch, label: "Fuzzy match" },
  "starts-with": { icon: ListStart, label: "Starts with" },
};

/**
 * Which language and how close each way a search can match a lexeme is, and a
 * few words explaining it.
 */
const KINDS: Readonly<
  Record<
    LexemeMatchKind,
    {
      hint: string;
      language: "english" | "latin";
      type: "contains" | "exact" | "fuzzy" | "starts-with";
    }
  >
> = {
  contains: {
    hint: "A translation mentions what you searched for",
    language: "english",
    type: "contains",
  },
  enclitic: {
    hint: "A form of this word with an enclitic, such as -que, attached",
    language: "latin",
    type: "exact",
  },
  "exact-form": {
    hint: "An inflected form of this word",
    language: "latin",
    type: "exact",
  },
  "exact-headword": {
    hint: "The headword is exactly what you searched for",
    language: "latin",
    type: "exact",
  },
  fuzzy: {
    hint: "A headword or form a few letters away from what you searched for",
    language: "latin",
    type: "fuzzy",
  },
  prefix: {
    hint: "The headword starts with what you searched for",
    language: "latin",
    type: "starts-with",
  },
  "translation-exact": {
    hint: "A translation is exactly what you searched for",
    language: "english",
    type: "exact",
  },
  "translation-prefix": {
    hint: "A translation starts with what you searched for",
    language: "english",
    type: "starts-with",
  },
};

// 🔖 Type

/**
 * How a search matched a lexeme.
 */
export interface LexemeMatchInfo {
  /** For a fuzzy match, how many edits it is from the query. */
  distance?: number | undefined;
  /** For a headword match on part of a word, how many letters it has beyond the query. */
  extraLetters?: number | undefined;
  kind: LexemeMatchKind;
}

/**
 * The ways a search can match a lexeme.
 */
export type LexemeMatchKind =
  | "contains"
  | "enclitic"
  | "exact-form"
  | "exact-headword"
  | "fuzzy"
  | "prefix"
  | "translation-exact"
  | "translation-prefix";

/**
 * The properties LexemeMatch accepts.
 */
export interface LexemeMatchProperties {
  className?: string;
  match: LexemeMatchInfo;
}

// 🧩 Component

/**
 * Two small icons saying how the search matched this lexeme: whether through a
 * Latin word or an English translation, and whether the match was exact, the
 * start of the word, or only part of it. Each explains itself in a tooltip.
 */
export function LexemeMatch(
  properties: Readonly<LexemeMatchProperties>,
): ReactNode {
  const { className, match } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const { hint, language, type } = KINDS[match.kind];
  const LanguageIcon = LANGUAGES[language].icon;
  const TypeIcon = TYPES[type].icon;
  const extra = describeExtent(match);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="lexeme-match"
    >
      <TooltipProvider>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Tooltip>
            <TooltipTrigger
              aria-label={LANGUAGES[language].label}
              className="rounded-md p-1 hover:bg-muted hover:text-foreground"
            >
              <LanguageIcon className="size-4" />
            </TooltipTrigger>
            <TooltipContent>{LANGUAGES[language].hint}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              aria-label={TYPES[type].label}
              className="rounded-md p-1 hover:bg-muted hover:text-foreground"
            >
              <TypeIcon className="size-4" />
            </TooltipTrigger>
            <TooltipContent>
              {TYPES[type].label}: {hint}
              {extra}
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}

// 🛠 Utilities

/**
 * Says how far a match is from the query: its edit distance when fuzzy, or the
 * letters a headword has beyond it.
 */
function describeExtent(match: LexemeMatchInfo): string {
  if (match.distance !== undefined) {
    return ` (${String(match.distance)} ${match.distance === 1 ? "edit" : "edits"} away)`;
  }
  if (match.extraLetters === undefined || match.extraLetters === 0) {
    return "";
  }
  return ` (+${String(match.extraLetters)} ${match.extraLetters === 1 ? "letter" : "letters"})`;
}
