import { LOGO_PATH } from "./meanderaw-logo.constants";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * Takes only a class name, which sizes and colors it.
 */
export interface MeanderawLogoProperties {
  className?: string;
}

// 🧩 Component

/**
 * Renders the Meanderaw logo as a drawing in the current text color; its class sizes it.
 */
export function MeanderawLogo(
  properties: Readonly<MeanderawLogoProperties>,
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
      data-testid="meanderaw-logo"
    >
      <svg
        aria-label="Meanderaw"
        className="size-full"
        fill="none"
        role="img"
        viewBox="0 0 51 9"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={LOGO_PATH}
          stroke="currentColor"
          strokeLinecap="square"
        />
      </svg>
    </div>
  );
}
