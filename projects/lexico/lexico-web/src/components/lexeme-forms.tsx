import { ChevronDown } from "lucide-react";
import { useState } from "react";

import {
  Button,
  cn,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@codebase/presentation";

import { AdjectiveForms } from "./adjective-forms";
import { NounForms } from "./noun-forms";
import { VerbForms } from "./verb-forms";

import type { ReactNode } from "react";

// ♟️ Constants

/**
 * The parts of speech that have a table of forms, and which kind of table.
 */
const TABLE_KINDS: Readonly<Record<string, "conjugation" | "declension">> = {
  adjective: "declension",
  determiner: "declension",
  noun: "declension",
  numeral: "declension",
  participle: "declension",
  pronoun: "declension",
  properNoun: "declension",
  suffix: "declension",
  verb: "conjugation",
};

// 🔖 Type

/**
 * One form of a lexeme and the word written for it, as the API reports it. Which
 * fields are filled depends on the kind of form.
 */
export interface LexemeFormRow {
  case?: string;
  degree?: string;
  gender?: string;
  id: string;
  /** The kind of form, such as `NominalForm` or `FiniteVerbForm`. */
  kind: string;
  mood?: string;
  number?: string;
  person?: string;
  tense?: string;
  voice?: string;
  word: string;
}

/**
 * The properties LexemeForms accepts.
 */
export interface LexemeFormsProperties {
  className?: string;
  lexemeId: string;
  loadForms: LoadLexemeForms;
  partOfSpeech: string;
}

/**
 * Loads every form of a lexeme with the word written for it.
 */
export type LoadLexemeForms = (lexemeId: string) => Promise<LexemeFormRow[]>;

/**
 * Where loading a lexeme's forms stands.
 */
type FormsState =
  | { rows: LexemeFormRow[]; status: "loaded" }
  | { status: "error" }
  | { status: "idle" }
  | { status: "loading" };

// 🧩 Component

/**
 * The declension or conjugation of a lexeme, folded away until asked for. The
 * forms are loaded the first time it opens, since most cards are never opened
 * and a verb alone has well over a hundred.
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

// 🔏 Private Functions

/**
 * The table for the kind of forms a lexeme turned out to have, or a note that
 * it has none.
 */
function FormsOfKind(
  properties: Readonly<{ partOfSpeech: string; rows: LexemeFormRow[] }>,
): ReactNode {
  const { partOfSpeech, rows } = properties;

  if (partOfSpeech === "verb") {
    return rows.length === 0 ? <NoForms /> : <VerbForms rows={rows} />;
  }

  const adjectival = rows.filter((row) => row.kind === "AdjectivalForm");
  const nominal = rows.filter((row) => row.kind === "NominalForm");

  if (adjectival.length > 0) {
    return <AdjectiveForms rows={adjectival} />;
  }

  return nominal.length === 0 ? <NoForms /> : <NounForms rows={nominal} />;
}

/**
 * The note shown when a lexeme has no forms on record.
 */
function NoForms(): ReactNode {
  return <p className="text-sm text-muted-foreground">No forms on record.</p>;
}
