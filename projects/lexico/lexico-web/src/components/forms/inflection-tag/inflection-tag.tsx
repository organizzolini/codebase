import { PillBadge } from "@codebase/presentation";

import { describeTag } from "./inflection-tag.utilities";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The properties InflectionTag accepts.
 */
export interface InflectionTagProperties {
  className?: string;
  /** Whether the tag's tab is the chosen one: solid and bold. */
  selected?: boolean;
  /** The grammatical value, such as "nominative" or "futurePerfect". */
  value: string;
}

// 🧩 Component

/**
 * A grammatical value as a small pill, colored by its category and carrying its full name for hover; solid and bold when selected.
 */
export function InflectionTag(
  properties: Readonly<InflectionTagProperties>,
): ReactNode {
  const { className, selected = false, value } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const { label, name, variant } = describeTag(value, selected);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="inflection-tag"
    >
      <PillBadge
        className={selected ? "font-semibold" : undefined}
        data-selected={selected ? "" : undefined}
        radius="full"
        size="sm"
        title={name}
        variant={variant}
      >
        {label}
      </PillBadge>
    </div>
  );
}
