import type { ReactNode } from "react";

// 🔖 Type

/**
 * Groups past the limit, whether all show, and the toggle.
 */
export interface TotalsMoreCardProperties {
  count: number;
  isShowingAll: boolean;
  onToggle: () => void;
}

// 🧩 Component

/**
 * Renders a dashed card offering the groups past the limit, or fewer again; nothing when none are past it.
 */
export function TotalsMoreCard(
  properties: Readonly<TotalsMoreCardProperties>,
): ReactNode {
  const { count, isShowingAll, onToggle } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (count <= 0) {
    return null;
  }

  // 🎨 Markup
  return (
    <li>
      <button
        aria-expanded={isShowingAll}
        className="text-muted-foreground hover:text-foreground hover:bg-muted flex h-full min-h-9 w-full cursor-pointer items-center justify-center rounded-md border border-dashed p-2 text-xs"
        data-testid="totals-more"
        onClick={onToggle}
        type="button"
      >
        {isShowingAll ? "Show fewer" : `+${String(count)} more`}
      </button>
    </li>
  );
}
