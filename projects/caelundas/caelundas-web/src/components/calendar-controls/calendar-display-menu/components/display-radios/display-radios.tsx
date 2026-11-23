import { RadioGroup, RadioGroupItem } from "@codebase/presentation";

import type { DisplayRadioOption } from "./display-radios.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * What the group is called, its choices, the one picked and what to do when another is.
 */
export interface DisplayRadiosProperties {
  className?: string;
  label: string;
  onValueChange: (value: string) => void;
  options: readonly DisplayRadioOption[];
  value: string;
}

// 🧩 Component

/**
 * Renders choices as a vertical radio group, each with an icon, the one picked checked.
 */
export function DisplayRadios(
  properties: Readonly<DisplayRadiosProperties>,
): ReactNode {
  const { className, label, onValueChange, options, value } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <RadioGroup
      aria-label={label}
      className={`gap-0 p-1 ${className ?? ""}`}
      data-testid="display-radios"
      onValueChange={(next: unknown) => {
        onValueChange(String(next));
      }}
      value={value}
    >
      {options.map((option) => {
        const Icon = option.icon;

        return (
          <label
            key={option.value}
            className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
          >
            <RadioGroupItem value={option.value} />
            <Icon
              aria-hidden="true"
              className="size-4 shrink-0"
            />
            {option.label}
          </label>
        );
      })}
    </RadioGroup>
  );
}
