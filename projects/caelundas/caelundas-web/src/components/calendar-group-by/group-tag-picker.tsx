import { useState } from "react";

import { DEFAULT_FILTER_LABELS } from "@codebase/presentation";

import { TAG_OPERATORS } from "../calendar-filters/event-filters.constants";
import { FilterTagEditor } from "../filter-tag-editor/filter-tag-editor";

import { NOTHING, TAG_IDS } from "./group-tag-picker.constants";

import type { EventGroupField } from "./event-groups.types";
import type { FilterEditorProps } from "@codebase/presentation";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The tag root to pick from, the tags picked, and where to send a changed
 * pick.
 */
export interface GroupTagPickerProperties {
  className?: string;
  field: EventGroupField;
  onChange: (tags: string[]) => void;
  tags: readonly string[];
}

// 🧩 Component

/**
 * Renders the tag tree a level of a grouping picks its groups from: the same
 * tree, with the same search, folding and counts, as the filter's value
 * editor for that root. Each tag ticked becomes a group of the events under
 * it, so several are picked together without listing their combinations.
 */
export function GroupTagPicker(
  properties: Readonly<GroupTagPickerProperties>,
): ReactNode {
  const { className, field, onChange, tags } = properties;

  // 🪝 Hooks
  const [query, setQuery] = useState("");

  // 🏗 Setup
  const needle = query.trim().toLowerCase();
  const items =
    needle === ""
      ? field.options
      : field.options.filter((option) =>
          option.label.toLowerCase().includes(needle),
        );
  const editorProperties: FilterEditorProps = {
    autoFocusProps: { autoFocus: false, ref: NOTHING },
    back: NOTHING,
    cancel: NOTHING,
    commit: NOTHING,
    field: {
      id: field.id,
      label: field.label,
      options: [...field.options],
      type: "multiselect",
    },
    host: "amend",
    labels: DEFAULT_FILTER_LABELS,
    onValueChange: (value: unknown) => {
      onChange(TAG_IDS.safeParse(value).data ?? []);
    },
    operator: { label: "is any of", value: TAG_OPERATORS.isAnyOf },
    options: {
      error: false,
      hasMore: false,
      items: [...items],
      loading: false,
      loadMore: NOTHING,
      query,
      resolve: () => {},
      retry: NOTHING,
      setQuery,
    },
    value: [...tags],
  };

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="group-tag-picker"
    >
      <FilterTagEditor
        {...editorProperties}
        cascade={false}
      />
    </div>
  );
}
