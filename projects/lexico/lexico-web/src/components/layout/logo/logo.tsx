import type { ReactNode } from "react";

// 🔖 Type

/**
 * Properties for the Logo component that displays the Lexico logo.
 */
export interface LogoProperties {
  className?: string;
  /** Width of the logo in pixels */
  width?: number | undefined;
}

// 🧩 Component

/**
 * Render the Lexico brand logo at a configurable width.
 */
export function Logo(properties: Readonly<LogoProperties>): ReactNode {
  const { className, width = 320 } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  // Logo has 4:3 aspect ratio
  const height = width * (4 / 3);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="logo"
    >
      <div
        className="flex items-center justify-center"
        style={{ height: `${String(height)}px`, width: `${String(width)}px` }}
      >
        <img
          alt="Lexico"
          className="object-contain"
          height={height}
          loading="eager"
          src="/lexico_logo.svg"
          width={width}
        />
      </div>
    </div>
  );
}
