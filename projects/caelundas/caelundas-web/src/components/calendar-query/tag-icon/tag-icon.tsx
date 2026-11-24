import { DynamicIcon } from "lucide-react/dynamic";

import { isIconName } from "./tag-icon.utilities";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * A lucide icon's slug and its classes.
 */
export interface TagIconProperties {
  className?: string;
  name: string;
}

// 🧩 Component

/**
 * Draws a tag's lucide icon by its slug, or nothing when lucide has no icon of that name.
 */
export function TagIcon(properties: Readonly<TagIconProperties>): ReactNode {
  const { className = "size-4 shrink-0", name } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (!isIconName(name)) {
    return null;
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="tag-icon"
      style={{ display: "contents" }}
    >
      <DynamicIcon
        aria-hidden="true"
        className={className}
        name={name}
      />
    </div>
  );
}
