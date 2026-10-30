import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@codebase/presentation";

import { KINDS, LANGUAGES, TYPES } from "./lexeme-match.constants";
import { describeExtent } from "./lexeme-match.utilities";

import type { LexemeMatchInfo } from "./lexeme-match.types";
import type { ReactNode } from "react";

// 🔖 Type

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
