import { Tabs, TabsList, TabsTrigger } from "@codebase/presentation";

import { ABBREVIATIONS } from "../lexeme-identifiers/lexeme-identifiers.constants";

import { NON_FINITE_ABBREVIATION } from "./verb-forms.constants";

import type { ReactNode } from "react";

// 🔖 Type

/** An axis's values, the picked one, and where picks go. */
export interface AxisTabsProperties {
  className?: string;
  onChange: (value: string) => void;
  options: string[];
  value: string | undefined;
}

// 🧩 Component

/**
 * One row of tabs for a conjugation axis, such as moods, each tab abbreviated and carrying its full name for hover.
 */
export function AxisTabs(properties: Readonly<AxisTabsProperties>): ReactNode {
  const { className, onChange, options, value } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns
  if (options.length === 0) {
    return undefined;
  }

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="axis-tabs"
    >
      <Tabs
        className="-mx-4 gap-0"
        onValueChange={(next: unknown) => {
          onChange(String(next));
        }}
        value={value}
      >
        <TabsList className="h-9 w-full gap-0 rounded-none border-t bg-muted p-0 group-data-horizontal/tabs:h-9">
          {options.map((option) => {
            const name = option.replaceAll(/([A-Z])/gu, " $1").toLowerCase();

            return (
              <TabsTrigger
                key={option}
                aria-label={name}
                className="h-full flex-1 rounded-none px-0.5 text-xs"
                title={name}
                value={option}
              >
                {ABBREVIATIONS[option] ?? NON_FINITE_ABBREVIATION}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}
