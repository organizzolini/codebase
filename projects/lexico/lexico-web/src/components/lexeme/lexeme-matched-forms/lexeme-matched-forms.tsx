import { PillBadge } from "@codebase/presentation";

import { InflectionTag } from "../../forms/inflection-tag/inflection-tag";

import { collapseMatches } from "./lexeme-matched-forms.utilities";

import type { MatchedForm } from "./lexeme-matched-forms.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties LexemeMatchedForms accepts.
 */
export interface LexemeMatchedFormsProperties {
  className?: string;
  /** The enclitic split off the searched word, such as "que". */
  enclitic?: null | string | undefined;
  matches: MatchedForm[];
}

// 🧩 Component

/**
 * The searched word as forms of this lexeme in one wrapping row: each matched form in bold, then each of its readings as a group of colored tags, such as "amo IND ACT PRES SG 1ST" or "opus NOM SG / VOC SG", folding a long list into "+N more".
 */
export function LexemeMatchedForms(
  properties: Readonly<LexemeMatchedFormsProperties>,
): ReactNode {
  const { className, enclitic, matches } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const { hidden, shown } = collapseMatches(matches);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (shown.length === 0 && !enclitic) {
    return undefined;
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="lexeme-matched-forms"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        {shown.map(({ groups, text }) => (
          <span
            key={text}
            className="inline-flex flex-wrap items-center gap-1"
          >
            <span className="font-semibold">{text}</span>
            {groups.map((group, position) => (
              <span
                key={group.join(" ")}
                className="inline-flex items-center gap-1"
              >
                {position > 0 && (
                  <span
                    className="text-muted-foreground"
                    aria-hidden
                  >
                    /
                  </span>
                )}
                <span className="inline-flex items-center gap-0.5">
                  {group.map((value) => (
                    <InflectionTag
                      key={value}
                      value={value}
                    />
                  ))}
                </span>
              </span>
            ))}
          </span>
        ))}
        {hidden.length > 0 && (
          <span
            className="text-xs text-muted-foreground"
            title={hidden.join(", ")}
          >
            +{hidden.length} more
          </span>
        )}
        {enclitic && (
          <PillBadge
            radius="full"
            size="sm"
            variant="secondary"
          >
            +{enclitic}
          </PillBadge>
        )}
      </div>
    </div>
  );
}
