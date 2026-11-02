import { SECTION_HEADING_CLASS_NAME } from "./night-sky-menu.constants";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * A section's heading and the controls it holds.
 */
export interface NightSkySectionProperties {
  children?: ReactNode;
  className?: string;
  title: string;
}

// 🧩 Component

/**
 * Renders one section of the Sky menu: a heading and, always shown, the
 * controls beneath it.
 */
export function NightSkySection(
  properties: Readonly<NightSkySectionProperties>,
): ReactNode {
  const { children, className, title } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="night-sky-section"
    >
      <h3 className={SECTION_HEADING_CLASS_NAME}>{title}</h3>
      <div className="flex flex-1 flex-col gap-1 pt-1 pb-2">{children}</div>
    </div>
  );
}
