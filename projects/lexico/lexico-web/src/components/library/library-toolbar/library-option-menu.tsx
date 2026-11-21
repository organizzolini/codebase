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
  Sortable,
} from "@codebase/presentation";

import { LIBRARY_STRIP_CHIPS } from "./library-toolbar.constants";
import { identify } from "./library-toolbar.utilities";

import type { LibraryOption } from "./library-option-menu.types";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The button's icon and label, the title and options its menu lists, which are checked, and what to call when one is picked.
 */
export interface LibraryOptionMenuProperties {
  /** The chips to join after the button, one for each checked option, in the order of `selected`. */
  children?: ReactNode;
  className?: string;
  icon: LucideIcon;
  label: string;
  /** Called with the checked values in their new order after a chip is dragged. */
  onReorder: (values: string[]) => void;
  onToggle: (value: string) => void;
  options: readonly LibraryOption[];
  /** The values checked now, in the order their chips show. */
  selected: readonly string[];
  /** What the menu's search box asks, such as "Sort by". */
  title: string;
}

// 🧩 Component

/**
 * A button that opens a searchable checklist of options, first in a sortable button group with the chips it is given joined after it.
 */
export function LibraryOptionMenu(
  properties: Readonly<LibraryOptionMenuProperties>,
): ReactNode {
  const {
    children,
    className,
    icon: Icon,
    label,
    onReorder,
    onToggle,
    options,
    selected,
    title,
  } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const checked = new Set(selected);

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-option-menu"
    >
      <Sortable
        className={LIBRARY_STRIP_CHIPS}
        getItemValue={identify}
        onValueChange={onReorder}
        render={<ButtonGroup />}
        strategy="horizontal"
        value={[...selected]}
      >
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
                          checked={checked.has(value)}
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
      </Sortable>
    </div>
  );
}
