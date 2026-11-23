import { Marker, MarkerContent, MarkerIcon } from "@codebase/presentation";

import { CARETS } from "./lexeme-section.constants";

import type { SectionState } from "./lexeme-section.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties LexemeSection accepts.
 */
export interface LexemeSectionProperties {
  children?: ReactNode;
  className?: string;
  /** Short note beside the divider, such as how many entries are hidden. */
  hint?: string | undefined;
  label: string;
  onToggle: () => void;
  state: SectionState;
}

// 🧩 Component

/**
 * One part of a lexeme card: a thin divider carrying its label on the left and
 * a caret on the right, which as a whole opens and closes what sits below it.
 */
export function LexemeSection(
  properties: Readonly<LexemeSectionProperties>,
): ReactNode {
  const { children, className, hint, label, onToggle, state } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const Caret = CARETS[state];

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-state={state}
      data-testid="lexeme-section"
    >
      <Marker
        aria-expanded={state !== "closed"}
        className="cursor-pointer py-1 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        onClick={onToggle}
        render={<button type="button" />}
      >
        <MarkerContent className="capitalize">{label}</MarkerContent>
        <span
          className="min-w-0 flex-1 border-t border-border"
          aria-hidden
        />
        {hint !== undefined && (
          <MarkerContent className="text-xs">{hint}</MarkerContent>
        )}
        <MarkerIcon>
          <Caret />
        </MarkerIcon>
      </Marker>
      {state !== "closed" && children}
    </div>
  );
}
