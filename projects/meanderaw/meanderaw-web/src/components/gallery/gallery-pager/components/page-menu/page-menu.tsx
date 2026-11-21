import { useState } from "react";

import {
  Button,
  ButtonGroup,
  Input,
  ToggleGroup,
  ToggleGroupItem,
} from "@codebase/presentation";

import { PAGE_SIZES } from "../../../../../hooks/use-gallery-search/use-gallery-search.constants";
import { toPosition } from "../../gallery-pager.utilities";

import type { ReactNode, SyntheticEvent } from "react";

// 🔖 Type

/**
 * The size, the page count, and two handlers.
 */
export interface PageMenuProperties {
  className?: string;
  onPage: (position: number) => void;
  onSizeChange: (size: number) => void;
  pageCount: number;
  size: number;
}

// 🧩 Component

/**
 * Renders the Page popover's body: the sizes to show per page, and a box to go straight to a page.
 */
export function PageMenu(properties: Readonly<PageMenuProperties>): ReactNode {
  const { className, onPage, onSizeChange, pageCount, size } = properties;

  // 🪝 Hooks
  const [typed, setTyped] = useState("");

  // 🏗 Setup

  // 💪 Handlers
  const handleSubmit = (event: SyntheticEvent): void => {
    event.preventDefault();

    const target = toPosition(typed, pageCount);

    if (target !== undefined) {
      onPage(target);
    }
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="page-menu"
    >
      <div className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs">Per page</span>
        <ToggleGroup
          aria-label="Per page"
          onValueChange={(pressed: string[]) => {
            const [next] = pressed;

            if (next !== undefined) {
              onSizeChange(Number(next));
            }
          }}
          size="sm"
          spacing={0}
          value={[String(size)]}
          variant="outline"
        >
          {PAGE_SIZES.map((option) => (
            <ToggleGroupItem
              key={option}
              value={String(option)}
            >
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <form
        className="mt-3 flex flex-col gap-1.5"
        onSubmit={handleSubmit}
      >
        <span className="text-muted-foreground text-xs">Go to page</span>
        <ButtonGroup>
          <Input
            aria-label="Page number"
            max={pageCount}
            min={1}
            onChange={(event) => {
              setTyped(event.target.value);
            }}
            placeholder={`1 to ${pageCount.toLocaleString("en-US")}`}
            type="number"
            value={typed}
          />
          <Button
            size="sm"
            type="submit"
            variant="outline"
          >
            Go
          </Button>
        </ButtonGroup>
      </form>
    </div>
  );
}
