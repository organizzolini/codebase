import {
  Button,
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
 * Two icons showing how a search matched: via Latin or English, and whether exact, a prefix, or partial. Each has a tooltip.
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
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger
              aria-label={LANGUAGES[language].label}
              render={
                <Button
                  size="icon-sm"
                  variant="ghost"
                />
              }
            >
              <LanguageIcon />
            </TooltipTrigger>
            <TooltipContent>{LANGUAGES[language].hint}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              aria-label={TYPES[type].label}
              render={
                <Button
                  size="icon-sm"
                  variant="ghost"
                />
              }
            >
              <TypeIcon />
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
