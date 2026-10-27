import { ChevronDown } from "lucide-react";
import { useState } from "react";

import {
  Button,
  Cascader,
  CascaderEmpty,
  CascaderFooter,
  CascaderInput,
  CascaderList,
  CascaderNav,
  CascaderPanel,
  CascaderStatus,
  CascaderVirtualItems,
  DEFAULT_FILTER_LABELS,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import type { EventGroupField } from "../lib/event-groups/event-groups.types";
import type { CascaderLabels, CascaderNode } from "@codebase/presentation";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The fields to pick from, the one picked, and where to send another.
 */
export interface GroupFieldPickerProperties {
  className?: string;
  fields: readonly EventGroupField[];
  /**
   * What the trigger is called for a screen reader, such as "Group 1 by".
   */
  label: string;
  onSelect: (field: EventGroupField) => void;
  value: string;
}

/**
 * The picker's own words, the filter's: the cascader reads its keys by other
 * names than the filter's labels, so they are bridged as the filter does.
 */
const LABELS: Partial<CascaderLabels> = {
  back: DEFAULT_FILTER_LABELS.back,
  empty: DEFAULT_FILTER_LABELS.empty,
  panelLabel: DEFAULT_FILTER_LABELS.fieldsLabel,
  rootLevel: DEFAULT_FILTER_LABELS.fieldsLabel,
  search: DEFAULT_FILTER_LABELS.searchFields,
};

const NOTHING = (): void => {};

// 🧩 Component

/**
 * Renders the field of a level of a grouping as the filter renders its
 * attributes: a button that opens a searchable list, each field named with a
 * sentence on what it is, in the filter's own picker panel.
 */
export function GroupFieldPicker(
  properties: Readonly<GroupFieldPickerProperties>,
): ReactNode {
  const { className, fields, label, onSelect, value } = properties;

  // 🪝 Hooks
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // 🏗 Setup
  const items: CascaderNode[] = [];

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const field of fields) {
    items.push({
      description: field.description,
      keywords: [field.label],
      label: field.label,
      value: field.id,
    });
  }

  const current = fields.find((field) => field.id === value);

  // 💪 Handlers
  const handleSelect = (picked: string): void => {
    const next = fields.find((field) => field.id === picked);

    setOpen(false);
    setQuery("");

    if (next !== undefined && next.id !== value) {
      onSelect(next);
    }
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="group-field-picker"
    >
      <Popover
        onOpenChange={setOpen}
        open={open}
      >
        <PopoverTrigger
          render={
            <Button
              aria-label={label}
              className="w-32 shrink-0 justify-between"
              size="sm"
              variant="outline"
            />
          }
        >
          <span className="truncate">{current?.label ?? value}</span>
          <ChevronDown
            aria-hidden="true"
            className="opacity-60"
          />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto min-w-56 p-0"
        >
          <Cascader
            indicator={false}
            inputValue={query}
            items={items}
            labels={LABELS}
            maxHeight={260}
            onInputValueChange={setQuery}
            onOpenChange={NOTHING}
            onPathChange={NOTHING}
            onValueChange={handleSelect}
            path={[]}
            searchScope="deep"
            value=""
            inline
            open
          >
            <CascaderPanel>
              <CascaderNav>
                <CascaderInput
                  placeholder={DEFAULT_FILTER_LABELS.searchFields}
                />
              </CascaderNav>
              <CascaderEmpty />
              <CascaderList>
                <CascaderVirtualItems />
              </CascaderList>
              <CascaderFooter />
              <CascaderStatus />
            </CascaderPanel>
          </Cascader>
        </PopoverContent>
      </Popover>
    </div>
  );
}
