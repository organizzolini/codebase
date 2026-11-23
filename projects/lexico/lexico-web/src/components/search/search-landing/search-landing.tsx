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
 * The empty state of the search page: the Lexico logo, as wide as the
 * search bar and centered below it, until there is a query to answer.
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
      <Logo className="w-full max-w-xl text-foreground" />
    </div>
  );
}
