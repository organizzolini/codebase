import { useCallback, useEffect, useState } from "react";

import { LexemeCard } from "../../lexeme/lexeme-card/lexeme-card";

import {
  getHistoryLexeme,
  HISTORY_LEXEME_STATUS,
} from "./history-lexeme.constants";

import type { LookupEntry } from "../../../hooks/use-lookup-history/use-lookup-history.types";
import type { LexemeFormRow } from "../../lexeme/lexeme-forms/lexeme-forms.types";
import type { HistoryLexemeState } from "./history-lexeme.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties HistoryLexeme accepts.
 */
export interface HistoryLexemeProperties {
  className?: string;
  entry: LookupEntry;
}

// 🧩 Component

/**
 * The full dictionary card of the lexeme a history entry recorded, exactly as
 * the search page shows it, loaded when the entry first appears.
 */
export function HistoryLexeme(
  properties: Readonly<HistoryLexemeProperties>,
): ReactNode {
  const { className, entry } = properties;

  // 🪝 Hooks
  const [state, setState] = useState<HistoryLexemeState>({ status: "loading" });

  // 🏗 Setup
  const lexeme = state.status === "ready" ? state.lexeme : null;

  // 💪 Handlers
  const loadForms = useCallback(
    async (): Promise<LexemeFormRow[]> =>
      await Promise.resolve(lexeme?.forms ?? []),
    [lexeme],
  );

  // ♻️ Lifecycle
  useEffect(() => {
    let isCurrent = true;
    const lexemeId = entry.lexemeId ?? null;

    setState({ status: "loading" });
    getHistoryLexeme({
      data: {
        form: lexemeId === null ? null : entry.form,
        lexemeId,
        word: entry.word,
      },
    }).then(
      (found) => {
        if (isCurrent) {
          setState(
            found === null
              ? { status: "missing" }
              : { lexeme: found, status: "ready" },
          );
        }
      },
      () => {
        if (isCurrent) {
          setState({ status: "failed" });
        }
      },
    );

    return (): void => {
      isCurrent = false;
    };
  }, [entry.form, entry.lexemeId, entry.word]);

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="history-lexeme"
    >
      {state.status === "ready" ? (
        <LexemeCard
          loadForms={loadForms}
          result={state.lexeme}
        />
      ) : (
        <p
          className="text-sm text-muted-foreground"
          role="status"
        >
          {HISTORY_LEXEME_STATUS[state.status]}
        </p>
      )}
    </div>
  );
}
