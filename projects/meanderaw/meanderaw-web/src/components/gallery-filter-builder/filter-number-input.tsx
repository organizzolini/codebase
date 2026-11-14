import { useState } from "react";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * A label, the value shown, and what to do with a value typed.
 */
export interface FilterNumberInputProperties {
  className?: string;
  isInteger?: boolean;
  /** Whether it takes any text, not only a number. */
  isText?: boolean;
  label: string;
  onValueChange: (value: number | string) => void;
  value: number | string;
}

// 🧩 Component

/**
 * Renders a box that keeps what is typed while it is not yet a value, and
 * hands on only the typed text or number that is finished.
 */
export function FilterNumberInput(
  properties: Readonly<FilterNumberInputProperties>,
): ReactNode {
  const {
    className,
    isInteger = false,
    isText = false,
    label,
    onValueChange,
    value,
  } = properties;

  // 🪝 Hooks
  const [draft, setDraft] = useState(String(value));

  // 🏗 Setup

  // 💪 Handlers
  const handleChange = (text: string): void => {
    setDraft(text);

    if (isText) {
      if (text !== "") {
        onValueChange(text);
      }

      return;
    }

    const parsed = Number(text);

    if (text.trim() !== "" && Number.isFinite(parsed)) {
      onValueChange(isInteger ? Math.trunc(parsed) : parsed);
    }
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="filter-number-input"
    >
      <input
        aria-label={label}
        className="w-24 rounded-md border border-(--line) bg-(--surface-raised) px-2 py-1"
        inputMode={isText ? "text" : "decimal"}
        onChange={(event) => {
          handleChange(event.target.value);
        }}
        value={draft}
      />
    </div>
  );
}
