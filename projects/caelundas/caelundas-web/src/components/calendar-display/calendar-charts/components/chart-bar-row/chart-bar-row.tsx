import type { ChartBar } from "../../calendar-charts.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * A bar to name and what a click on it does.
 */
export interface ChartBarRowProperties {
  bar: ChartBar;
  onToggle: (id: string, color?: string) => void;
}

// 🧩 Component

/**
 * Renders a group's column as an accessible button named by group and value; a click toggles the group.
 */
export function ChartBarRow(
  properties: Readonly<ChartBarRowProperties>,
): ReactNode {
  const { bar, onToggle } = properties;
  const { target } = bar;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers
  const handleClick = (): void => {
    if (target !== undefined) {
      onToggle(target, bar.color);
    }
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <li data-testid="chart-bar">
      <button
        aria-disabled={target === undefined}
        aria-expanded={bar.isExpandable ? false : undefined}
        aria-label={bar.ariaLabel}
        className="hover:bg-accent focus-visible:ring-ring cursor-pointer rounded-md border px-2 py-1 text-xs outline-none focus-visible:ring-2 aria-disabled:cursor-default"
        onClick={handleClick}
        title={
          bar.isExpandable
            ? `Open ${bar.label}`
            : target === undefined
              ? bar.label
              : "Close the group"
        }
        type="button"
      >
        {bar.label}: {bar.text}
      </button>
    </li>
  );
}
