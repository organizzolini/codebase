import { ChevronDown } from "lucide-react";
import { useState } from "react";

import {
  cn,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@codebase/components-web";

import type { ReactNode } from "react";

// ♟️ Constants

/**
 * How many translations show before the rest fold away, so one entry with
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
 * A lexeme's English translations as a bulleted list: the first two, with the
 * rest behind a toggle.
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
        <ul className="list-disc space-y-1 pl-5 text-sm">
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
        {folded.length > 0 && (
          <CollapsibleTrigger className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            {isOpen ? "Show fewer" : `Show ${folded.length} more`}
            <ChevronDown
              className={cn(
                "size-3 transition-transform",
                isOpen && "rotate-180",
              )}
            />
          </CollapsibleTrigger>
        )}
      </Collapsible>
    </div>
  );
}
