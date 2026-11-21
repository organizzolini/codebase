import { useState } from "react";

import { MAXIMUM_FILTER_TEXT_LENGTH } from "../../gallery-filter-builder.constants";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * A label, the value shown, and what to do with one typed.
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
 * Renders a box that holds what is typed, handing on a finished number or text when it is committed.
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
  const [seen, setSeen] = useState(value);

  // 🏗 Setup
  const shown = String(value);

  // A value that changed elsewhere, such as a new field's, replaces what was
  // typed, unless what was typed already says the same.
  if (seen !== value) {
    setSeen(value);

    if (isText ? draft !== shown : Number(draft) !== value) {
      setDraft(shown);
    }
  }

  // 💪 Handlers
  const handleCommit = (): void => {
    if (isText) {
      if (draft !== shown) {
        onValueChange(draft);
      }

      return;
    }

    const parsed = Number(draft);
    const isSound =
      draft.trim() !== "" &&
      (isInteger ? Number.isSafeInteger(parsed) : Number.isFinite(parsed));

    if (!isSound) {
      setDraft(shown);
    } else if (parsed !== value) {
      onValueChange(parsed);
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
        maxLength={MAXIMUM_FILTER_TEXT_LENGTH}
        onBlur={handleCommit}
        onChange={(event) => {
          setDraft(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            handleCommit();
          }
        }}
        value={draft}
      />
    </div>
  );
}
