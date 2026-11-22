import { useState } from "react";

import { Button } from "@codebase/presentation";

import { LexemeSection } from "../lexeme-section/lexeme-section";

import { FormsOfKind } from "./forms-of-kind";
import { TABLE_KINDS } from "./lexeme-forms.constants";

import type { FormsState, LoadLexemeForms } from "./lexeme-forms.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties LexemeForms accepts.
 */
export interface LexemeFormsProperties {
  className?: string;
  lexemeId: string;
  loadForms: LoadLexemeForms;
  partOfSpeech: string;
}

// 🧩 Component

/**
 * A lexeme's declension or conjugation, folded away until opened; its forms load on first open through the route's loader.
 */
export function LexemeForms(
  properties: Readonly<LexemeFormsProperties>,
): ReactNode {
  const { className, lexemeId, loadForms, partOfSpeech } = properties;

  // 🪝 Hooks
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<FormsState>({ status: "idle" });

  // 🏗 Setup
  const tableKind = TABLE_KINDS[partOfSpeech];

  // 💪 Handlers
  /**
   * Asks for the forms, unless they are already loaded or on their way.
   */
  function load(): void {
    if (state.status === "loaded" || state.status === "loading") {
      return;
    }

    setState({ status: "loading" });
    loadForms(lexemeId)
      .then((rows) => {
        setState({ rows, status: "loaded" });
      })
      .catch(() => {
        setState({ status: "error" });
      });
  }

  /**
   * Opens or closes the table, loading the forms on the way open.
   */
  function handleToggle(): void {
    setIsOpen(!isOpen);

    if (!isOpen) {
      load();
    }
  }

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (tableKind === undefined) {
    return undefined;
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="lexeme-forms"
    >
      <LexemeSection
        label={tableKind}
        onToggle={handleToggle}
        state={isOpen ? "open" : "closed"}
      >
        {state.status === "loading" && (
          <p className="pb-1 text-sm text-muted-foreground">Loading forms…</p>
        )}
        {state.status === "error" && (
          <div className="space-y-2 pb-1 text-sm">
            <p className="text-muted-foreground">
              The forms could not be loaded.
            </p>
            <Button
              onClick={load}
              size="sm"
              variant="outline"
            >
              Try again
            </Button>
          </div>
        )}
        {state.status === "loaded" && (
          <FormsOfKind
            partOfSpeech={partOfSpeech}
            rows={state.rows}
          />
        )}
      </LexemeSection>
    </div>
  );
}
