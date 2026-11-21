import { Logo } from "../../layout/logo/logo";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties SearchLanding accepts.
 */
export interface SearchLandingProperties {
  className?: string;
}

// 🧩 Component

/**
 * The empty state of the search page: the Lexico logo and a line on what to
 * search, above the search bar, until there is a query to answer.
 */
export function SearchLanding(
  properties: Readonly<SearchLandingProperties>,
): ReactNode {
  const { className } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="search-landing"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <Logo
          className="text-foreground"
          width={72}
        />
        <p className="text-sm text-muted-foreground">
          Search Latin and English at once.
        </p>
      </div>
    </div>
  );
}
