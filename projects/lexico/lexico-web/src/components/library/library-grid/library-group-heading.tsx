import type { ReactNode } from "react";

// 🔖 Type

/**
 * The group's name, such as an era.
 */
export interface LibraryGroupHeadingProperties {
  className?: string;
  heading: string;
}

// 🧩 Component

/**
 * A heading across the whole grid row, above the author cards of one group.
 */
export function LibraryGroupHeading(
  properties: Readonly<LibraryGroupHeadingProperties>,
): ReactNode {
  const { className, heading } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-group-heading"
    >
      <h2 className="text-xl font-semibold">{heading}</h2>
    </div>
  );
}
