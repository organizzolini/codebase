import { SECTION_CLASS_NAME } from "./night-sky-menu.constants";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * A group's name, for assistive technology only, and the controls it holds.
 */
export interface NightSkySectionProperties {
  children?: ReactNode;
  className?: string;
  title: string;
}

// 🧩 Component

/**
 * Renders one group of the Sky menu's controls under a hidden legend, so a screen reader names the group.
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
      <fieldset className={SECTION_CLASS_NAME}>
        <legend className="sr-only">{title}</legend>
        {children}
      </fieldset>
    </div>
  );
}
