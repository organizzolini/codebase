import { ChevronDown } from "lucide-react";
import { useState } from "react";

import {
  Button,
  cn,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@codebase/presentation";

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
 * The declension or conjugation of a lexeme, folded away until asked for. The
 * forms are loaded the first time it opens through the loader the route gives
 * this component.
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
  function handleOpenChange(open: boolean): void {
    setIsOpen(open);

    if (open) {
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
      <Collapsible
        onOpenChange={handleOpenChange}
        open={isOpen}
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium capitalize">
          {tableKind}
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2">
            {state.status === "loading" && (
              <p className="text-sm text-muted-foreground">Loading forms…</p>
            )}
            {state.status === "error" && (
              <div className="space-y-2 text-sm">
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
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
