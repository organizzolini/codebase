import { ChevronDown } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@codebase/presentation";

import { SECTION_TRIGGER_CLASS_NAME } from "./night-sky-menu.constants";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * A section's header, whether it starts open, and the controls it holds.
 */
export interface NightSkySectionProperties {
  children?: ReactNode;
  className?: string;
  /** Opens the section at first. Defaults to true. */
  defaultOpen?: boolean;
  title: string;
}

// 🧩 Component

/**
 * Renders one section of the Night sky submenu: a header that opens and
 * closes it, and the controls beneath it.
 */
export function NightSkySection(
  properties: Readonly<NightSkySectionProperties>,
): ReactNode {
  const { children, className, defaultOpen = true, title } = properties;

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
      <Collapsible defaultOpen={defaultOpen}>
        <CollapsibleTrigger className={SECTION_TRIGGER_CLASS_NAME}>
          {title}
          <ChevronDown
            aria-hidden="true"
            className="size-4 transition-transform group-data-[panel-open]:rotate-180"
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-1 pt-1 pb-2">
          {children}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
