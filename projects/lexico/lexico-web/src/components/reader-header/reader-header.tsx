import { Link } from "@tanstack/react-router";

import { Badge } from "@codebase/presentation";

import { describeFacts } from "./reader-header.utilities";

import type { ReaderText } from "../reader-lines/reader-lines.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties ReaderHeader accepts.
 */
export interface ReaderHeaderProperties {
  className?: string;
  text: ReaderText;
}

// 🧩 Component

/**
 * The subheader beneath a text's title: its author and parent work, then its
 * era, collection, dates, and other characteristics, all centered.
 */
export function ReaderHeader(
  properties: Readonly<ReaderHeaderProperties>,
): ReactNode {
  const { className, text } = properties;
  const { author, parentText } = text;

  // 🪝 Hooks

  // 🏗 Setup
  const facts = describeFacts(text);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="reader-header"
    >
      <div className="space-y-2 text-center">
        <p className="text-sm text-muted-foreground">
          <Link
            className="underline"
            search={{ search: author.name }}
            to="/library"
          >
            {author.name}
          </Link>
          {parentText === null ? null : (
            <>
              {" · "}
              <Link
                className="underline"
                params={{ slug: parentText.slug }}
                to="/texts/$slug"
              >
                {parentText.title}
              </Link>
            </>
          )}
        </p>
        {facts.length === 0 ? null : (
          <ul
            aria-label="About this text"
            className="flex flex-wrap justify-center gap-2"
          >
            {facts.map(({ label, value }) => (
              <li key={label}>
                <Badge variant="outline">
                  <span className="text-muted-foreground">{label}</span>
                  {value}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
