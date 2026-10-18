import { ChevronDown } from "lucide-react";
import { useState } from "react";

import {
  cn,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@codebase/interface";

import type { ReactNode } from "react";

// ♟️ Constants

/**
 * How many translations show while the section is folded, so one entry with
 * dozens of senses cannot dominate the masonry.
 */
const VISIBLE_TRANSLATION_COUNT = 2;

// 🔖 Type

/**
 * The properties LexemeTranslations accepts.
 */
export interface LexemeTranslationsProperties {
  className?: string;
  translations: string[];
}

// 🧩 Component

/**
 * A lexeme's English translations as a bulleted list under a heading. Folded,
 * it shows the first two; opened, all of them.
 */
export function LexemeTranslations(
  properties: Readonly<LexemeTranslationsProperties>,
): ReactNode {
  const { className, translations } = properties;

  // 🪝 Hooks
  const [isOpen, setIsOpen] = useState(false);

  // 🏗 Setup
  const shown = translations.slice(0, VISIBLE_TRANSLATION_COUNT);
  const folded = translations.slice(VISIBLE_TRANSLATION_COUNT);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="lexeme-translations"
    >
      <Collapsible
        onOpenChange={setIsOpen}
        open={isOpen}
      >
        <CollapsibleTrigger
          className="flex w-full items-center justify-between text-sm font-medium"
          disabled={folded.length === 0}
        >
          Translations
          {folded.length > 0 && (
            <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
              {!isOpen && `+${String(folded.length)} more`}
              <ChevronDown
                className={cn(
                  "size-4 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </span>
          )}
        </CollapsibleTrigger>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {shown.map((translation) => (
            <li key={translation}>{translation}</li>
          ))}
        </ul>
        <CollapsibleContent>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
            {folded.map((translation) => (
              <li key={translation}>{translation}</li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
