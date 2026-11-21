import {
  Button,
  ButtonGroup,
  Checkbox,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import type { LibraryOption } from "./library-option-menu.types";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The button's icon and label, the title and options its menu lists, which are checked, and what to call when one is picked.
 */
export interface LibraryOptionMenuProperties {
  /** The segments to join after the button, one for each checked option. */
  children?: ReactNode;
  className?: string;
  icon: LucideIcon;
  label: string;
  onToggle: (value: string) => void;
  options: readonly LibraryOption[];
  /** The values checked now. */
  selected: ReadonlySet<string>;
  /** What the menu's search box asks, such as "Sort by". */
  title: string;
}

// 🧩 Component

/**
 * A button that opens a searchable checklist of options, first in a button group with the segments it is given joined after it.
 */
export function LibraryOptionMenu(
  properties: Readonly<LibraryOptionMenuProperties>,
): ReactNode {
  const {
    children,
    className,
    icon: Icon,
    label,
    onToggle,
    options,
    selected,
    title,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-option-menu"
    >
      <ButtonGroup>
        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
              />
            }
          >
            <Icon aria-hidden="true" />
            {label}
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-80 p-0"
          >
            <Command>
              <CommandInput placeholder={`${title}...`} />
              <CommandList>
                <CommandEmpty>No match.</CommandEmpty>
                <CommandGroup heading={title}>
                  {options.map(
                    ({ icon: OptionIcon, label: optionLabel, value }) => (
                      <CommandItem
                        key={value}
                        onSelect={() => {
                          onToggle(value);
                        }}
                        value={optionLabel}
                      >
                        <Checkbox
                          checked={selected.has(value)}
                          tabIndex={-1}
                        />
                        <OptionIcon aria-hidden="true" />
                        <span className="whitespace-nowrap">{optionLabel}</span>
                      </CommandItem>
                    ),
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {children}
      </ButtonGroup>
    </div>
  );
}
