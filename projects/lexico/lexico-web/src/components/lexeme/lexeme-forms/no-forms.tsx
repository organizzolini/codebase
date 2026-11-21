import type { ReactNode } from "react";

// 🔖 Type

/**
 * The note takes nothing but where to sit.
 */
export interface NoFormsProperties {
  className?: string;
}

// 🧩 Component

/**
 * The note shown when a lexeme has no forms on record.
 */
export function NoForms(properties: Readonly<NoFormsProperties>): ReactNode {
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
      data-testid="no-forms"
    >
      <p className="text-sm text-muted-foreground">No forms on record.</p>
    </div>
  );
}
