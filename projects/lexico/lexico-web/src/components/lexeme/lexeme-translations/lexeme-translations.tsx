import { useCallback, useState } from "react";

import { cn } from "@codebase/presentation";

import { LexemeSection } from "../lexeme-section/lexeme-section";

import { NEXT_STATE, PREVIEW_CLASS } from "./lexeme-translations.constants";
import { countClipped } from "./lexeme-translations.utilities";

import type { SectionState } from "../lexeme-section/lexeme-section.types";
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
 * A lexeme's English translations under a divider that cycles through three
 * states (preview, whole list, closed), or two when it fits the preview.
 */
export function LexemeTranslations(
  properties: Readonly<LexemeTranslationsProperties>,
): ReactNode {
  const { className, translations } = properties;

  // 🪝 Hooks
  const [state, setState] = useState<SectionState>("half");
  const [clipped, setClipped] = useState(0);

  // 🏗 Setup
  const fits = clipped === 0;
  const shown = fits && state === "half" ? "open" : state;
  const hint =
    shown === "half" && clipped > 0 ? `+${String(clipped)} more` : undefined;

  // 💪 Handlers
  /** Skips the preview when the whole list already fits in it. */
  const toggle = (): void => {
    setState(fits ? (shown === "open" ? "closed" : "open") : NEXT_STATE[state]);
  };

  // ♻️ Lifecycle
  /**
   * Counts what the preview hides now and whenever the list changes size.
   */
  const measure = useCallback((node: HTMLUListElement | null) => {
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(() => {
            setClipped(node === null ? 0 : countClipped(node));
          });

    if (node !== null) {
      setClipped(countClipped(node));
      observer?.observe(node);
    }

    return () => {
      observer?.disconnect();
    };
  }, []);

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="lexeme-translations"
    >
      <LexemeSection
        hint={hint}
        label="Translations"
        onToggle={toggle}
        state={shown}
      >
        <ul
          ref={measure}
          className={cn(
            "list-disc pl-5 text-sm leading-5",
            shown === "half" && PREVIEW_CLASS,
          )}
        >
          {translations.map((translation) => (
            <li key={translation}>{translation}</li>
          ))}
        </ul>
      </LexemeSection>
    </div>
  );
}
