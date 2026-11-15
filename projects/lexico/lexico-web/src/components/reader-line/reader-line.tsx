import { Fragment } from "react";

import { WordCard } from "../word-card/word-card";

import type { ReaderLineNode } from "../reader-lines/reader-lines.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties ReaderLine accepts.
 */
export interface ReaderLineProperties {
  className?: string;
  line: ReaderLineNode;
}

// 🧩 Component

/**
 * One line of a text: its label, then each word as a button that opens its
 * word card and each punctuation mark as plain text.
 */
export function ReaderLine(
  properties: Readonly<ReaderLineProperties>,
): ReactNode {
  const { className, line } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const tokens = line.tokens.edges.map((edge) => edge.node);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="reader-line"
      id={`line-${line.index}`}
    >
      <span className="inline-block w-14 pr-3 text-right text-sm text-muted-foreground">
        {line.label}
      </span>
      {tokens.map((token, position) =>
        token.isPunctuation ? (
          <Fragment key={token.id}>{token.data}</Fragment>
        ) : (
          <Fragment key={token.id}>
            {position === 0 ? "" : " "}
            <WordCard
              className="inline"
              token={token}
            />
          </Fragment>
        ),
      )}
    </div>
  );
}
