import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@codebase/presentation";

import { ALL_TAGS_FIELD } from "../../../calendar-group-strip/components/event-group-model/event-group-fields.constants";
import { QueryCascader } from "../../../query-cascader/query-cascader";
import { SelectIcon, TITLE } from "../../calendar-select-strip.constants";
import {
  isColumnChoice,
  toColumnIds,
} from "../../calendar-select-strip.utilities";

import type { CascaderNode } from "@codebase/presentation";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The columns shown, the choices, and the change handler.
 */
export interface ColumnPickerProperties {
  ids: readonly string[];
  items: CascaderNode[];
  onColumnsChange: (columns: readonly string[] | undefined) => void;
}

// 🧩 Component

/**
 * Renders the Select button, opening a searchable list of the columns to show in the table.
 */
export function ColumnPicker(
  properties: Readonly<ColumnPickerProperties>,
): ReactNode {
  const { ids, items, onColumnsChange } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            size="sm"
            variant="outline"
          >
            <SelectIcon aria-hidden="true" />
            {TITLE}
          </Button>
        }
      />
      <PopoverContent
        align="start"
        aria-label="Select columns"
        className="w-80 max-w-[90vw] p-0"
      >
        <QueryCascader
          cascade={false}
          defaultExpanded={[ALL_TAGS_FIELD]}
          items={items}
          mode="tree"
          onValueChange={(next) => {
            onColumnsChange(toColumnIds(next, ids));
          }}
          placeholder="Select columns"
          selectable={isColumnChoice}
          value={[...ids]}
          multiple
        />
      </PopoverContent>
    </Popover>
  );
}
