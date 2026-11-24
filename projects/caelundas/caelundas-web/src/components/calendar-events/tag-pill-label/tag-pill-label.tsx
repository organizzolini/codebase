import { TagLead } from "../tag-lead/tag-lead";

import type { ReactNode } from "react";

// 🔖 Type

/** A tag's id, to find its icon, and the name to write. */
export interface TagPillLabelProperties {
  className?: string;
  id: string;
  label: string;
}

// 🧩 Component

/**
 * Renders a tag's pill content: the symbol that leads its name, then the name.
 */
export function TagPillLabel(
  properties: Readonly<TagPillLabelProperties>,
): ReactNode {
  const {
    className = "inline-flex items-center gap-1",
    id,
    label,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="tag-pill-label"
    >
      <TagLead
        id={id}
        label={label}
      />
      {label}
    </div>
  );
}
