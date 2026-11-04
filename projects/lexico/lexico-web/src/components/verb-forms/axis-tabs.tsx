import { Tabs, TabsList, TabsTrigger } from "@codebase/presentation";

import { ABBREVIATIONS } from "../lexeme-identifiers/lexeme-identifiers.constants";

import { NON_FINITE_ABBREVIATION } from "./verb-forms.constants";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The values one axis of a conjugation can take, the one picked, and where to
 * send another pick.
 */
export interface AxisTabsProperties {
  className?: string;
  onChange: (value: string) => void;
  options: string[];
  value: string | undefined;
}

// 🧩 Component

/**
 * One row of tabs for a single axis of the conjugation, such as its moods. A row
 * runs the full width of the card, out through its padding, and the rows and the
 * table below them are joined into one block.
 * Each tab is the usual abbreviation, such as IND or PRES, so that all of them
 * share one row and fill it, and carries its full name for readers and hover.
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
