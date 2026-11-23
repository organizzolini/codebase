import { EllipsisVertical } from "lucide-react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@codebase/presentation";

import type { SegmentAction } from "./gallery-segment.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * What the segment shows, what pressing it does, and its menu.
 */
export interface GallerySegmentProperties {
  actions: readonly SegmentAction[];
  /** Names the segment for assistive technology. */
  ariaLabel: string;
  className?: string;
  /** What the label button shows. */
  label: ReactNode;
  menuLabel: string;
  title?: string;
}

// 🧩 Component

/**
 * Renders a label button and an ellipsis menu beside it, for the button group it sits in.
 */
export function GallerySegment(
  properties: Readonly<GallerySegmentProperties>,
): ReactNode {
  const { actions, ariaLabel, className, label, menuLabel, title } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="gallery-segment"
    >
      <Button
        aria-label={ariaLabel}
        size="sm"
        title={title}
        variant="outline"
      >
        {label}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={menuLabel}
              size="icon-sm"
              variant="outline"
            />
          }
        >
          <EllipsisVertical aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-max min-w-32"
        >
          {actions.map(
            ({
              icon: Icon,
              isDestructive,
              isDisabled,
              label: text,
              onSelect,
            }) => (
              <DropdownMenuItem
                key={text}
                disabled={isDisabled}
                onClick={onSelect}
                variant={isDestructive === true ? "destructive" : "default"}
              >
                <Icon aria-hidden="true" />
                <span className="min-w-0 truncate">{text}</span>
              </DropdownMenuItem>
            ),
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
