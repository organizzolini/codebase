import type { ReactNode } from "react";

// 🔖 Type

/**
 * A share in percent, and the color it is drawn in.
 */
export interface TotalsShareBarProperties {
  color: string;
  share: null | number;
}

// 🧩 Component

/**
 * Draws a thin bar filled to a group's share of the whole; nothing without a share.
 */
export function TotalsShareBar(
  properties: Readonly<TotalsShareBarProperties>,
): ReactNode {
  const { color, share } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (share === null) {
    return null;
  }

  // 🎨 Markup
  return (
    <div
      aria-hidden="true"
      className="bg-muted h-1 overflow-hidden rounded-full"
      data-testid="totals-share"
    >
      <div
        className="h-full rounded-full"
        style={{ background: color, width: `${String(share)}%` }}
      />
    </div>
  );
}
