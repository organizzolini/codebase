import { Tabs, TabsList, TabsTrigger } from "@codebase/presentation";

import {
  FORMS_TAB,
  FORMS_TAB_LIST,
} from "../forms-table/forms-table.constants";
import { InflectionTag } from "../inflection-tag/inflection-tag";

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
 * One row of tabs for a conjugation axis, such as moods, each tab a colored pill and carrying its full name for hover.
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
        onValueChange={(next: unknown) => {
          onChange(String(next));
        }}
        value={value}
      >
        <TabsList
          className={FORMS_TAB_LIST}
          variant="line"
        >
          {options.map((option) => {
            const name = option.replaceAll(/([A-Z])/gu, " $1").toLowerCase();

            return (
              <TabsTrigger
                key={option}
                aria-label={name}
                className={FORMS_TAB}
                title={name}
                value={option}
              >
                <InflectionTag value={option} />
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}
