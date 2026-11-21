import { ChevronDown } from "lucide-react";
import { useState } from "react";

import {
  Button,
  cn,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@codebase/presentation";

import { VISIBLE_TRANSLATION_COUNT } from "./lexeme-translations.constants";

import type { ReactNode } from "react";

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
          disabled={folded.length === 0}
          render={
            <Button
              className="w-full justify-between"
              variant="ghost"
            />
          }
        >
          Translations
          {folded.length > 0 && (
            <span className="flex items-center gap-1 text-muted-foreground">
              {!isOpen && `+${String(folded.length)} more`}
              <ChevronDown
                className={cn("transition-transform", isOpen && "rotate-180")}
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
