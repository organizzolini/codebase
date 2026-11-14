import { FilterRuleEditor } from "./filter-rule-editor";
import {
  COMBINATOR_LABELS,
  FILTER_COMBINATORS,
  filterCombinatorSchema,
  MAXIMUM_FILTER_DEPTH,
} from "./gallery-filter-builder.constants";
import {
  addNode,
  createGroup,
  createRule,
  removeNode,
  setCombinator,
} from "./gallery-filter-builder.utilities";

import type {
  FilterEdit,
  FilterField,
  FilterGroup,
} from "./gallery-filter-builder.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * A group, its place in the tree, and how to edit it.
 */
export interface FilterGroupEditorProperties {
  className?: string;
  fields: readonly FilterField[];
  group: FilterGroup;
  /** Whether the filter holds as many rules and groups as the API takes. */
  isFull: boolean;
  onEdit: (edit: FilterEdit) => void;
  /** The index of each node from the root down to this group. */
  path: readonly number[];
}

// 🧩 Component

/**
 * Renders one group: how it joins its nodes, the nodes, and the buttons that
 * add a rule or a nested group.
 */
export function FilterGroupEditor(
  properties: Readonly<FilterGroupEditorProperties>,
): ReactNode {
  const { className, fields, group, isFull, onEdit, path } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const [first] = fields;
  const name =
    path.length === 0
      ? "Filter group"
      : `Filter group ${path.map((index) => index + 1).join(".")}`;

  // 💪 Handlers
  const handleAddRule = (): void => {
    if (first !== undefined) {
      onEdit(addNode(path, createRule(first)));
    }
  };
  const handleAddGroup = (): void => {
    if (first !== undefined) {
      onEdit(addNode(path, createGroup(first)));
    }
  };

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      aria-label={name}
      className={className}
      data-testid="filter-group-editor"
      role="group"
    >
      <div className="flex flex-col gap-2 rounded-md border border-(--line) p-2">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label className="flex items-center gap-2">
            Match
            <select
              className="rounded-md border border-(--line) bg-(--surface-raised) px-2 py-1"
              onChange={(event) => {
                onEdit(
                  setCombinator(
                    path,
                    filterCombinatorSchema.parse(event.target.value),
                  ),
                );
              }}
              value={group.combinator}
            >
              {FILTER_COMBINATORS.map((combinator) => (
                <option
                  key={combinator}
                  value={combinator}
                >
                  {COMBINATOR_LABELS[combinator]}
                </option>
              ))}
            </select>
          </label>
          {path.length > 0 && (
            <button
              className="rounded-md border border-(--line) px-2 py-1"
              onClick={() => {
                onEdit(removeNode(path));
              }}
              type="button"
            >
              Remove group
            </button>
          )}
        </div>
        {group.rules.length === 0 && (
          <p className="text-sm text-(--ink-muted)">
            No filters yet. Add a rule to narrow the meanders.
          </p>
        )}
        {group.rules.map((node, index) =>
          "rules" in node ? (
            <FilterGroupEditor
              key={`${String(index)}-group`}
              fields={fields}
              group={node}
              isFull={isFull}
              onEdit={onEdit}
              path={[...path, index]}
            />
          ) : (
            <FilterRuleEditor
              key={`${String(index)}-rule`}
              fields={fields}
              onEdit={onEdit}
              path={[...path, index]}
              rule={node}
            />
          ),
        )}
        <div className="flex gap-2 text-sm">
          <button
            className="rounded-md border border-(--line) px-3 py-1 disabled:opacity-50"
            disabled={isFull}
            onClick={handleAddRule}
            type="button"
          >
            Add rule
          </button>
          <button
            className="rounded-md border border-(--line) px-3 py-1 disabled:opacity-50"
            disabled={isFull || path.length + 1 >= MAXIMUM_FILTER_DEPTH}
            onClick={handleAddGroup}
            type="button"
          >
            Add group
          </button>
        </div>
      </div>
    </div>
  );
}
