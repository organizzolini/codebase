import {
  COMBINATOR_LABELS,
  FILTER_COMBINATORS,
  filterCombinatorSchema,
} from "../gallery-filter-builder/gallery-filter-builder.constants";
import {
  removeNode,
  setCombinator,
  setRule,
} from "../gallery-filter-builder/gallery-filter-builder.utilities";

import { FilterPill } from "./filter-pill";

import type {
  FilterEdit,
  FilterField,
  FilterGroup,
} from "../gallery-filter-builder/gallery-filter-builder.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * A group of filters, its place, and the edit.
 */
export interface FilterPillGroupProperties {
  className?: string;
  fields: readonly FilterField[];
  group: FilterGroup;
  onEdit: (edit: FilterEdit) => void;
  /** The index of each node from the root down to this group. */
  path: readonly number[];
}

// 🧩 Component

/**
 * Renders a group's filters as pills joined by its combinator; a nested
 * group is parenthesized with its own match and remove controls.
 */
export function FilterPillGroup(
  properties: Readonly<FilterPillGroupProperties>,
): ReactNode {
  const { className, fields, group, onEdit, path } = properties;

  // 🪝 Hooks

  // 🏗 Setup
  const isRoot = path.length === 0;
  const hasParentheses =
    !isRoot || (group.combinator === "or" && group.rules.length > 1);
  const name = isRoot
    ? "Filter group"
    : `Filter group ${path.map((index) => index + 1).join(".")}`;

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      aria-label={name}
      className={className}
      data-testid="filter-pill-group"
      role="group"
    >
      {hasParentheses && <span aria-hidden="true">(</span>}
      {group.rules.map((node, index) => {
        const nodePath = [...path, index];
        const separator = index > 0 && (
          <span
            aria-hidden="true"
            className="text-xs text-(--ink-muted)"
          >
            {group.combinator}
          </span>
        );

        return "rules" in node ? (
          <span
            key={`${String(index)}-group`}
            className="contents"
          >
            {separator}
            <FilterPillGroup
              className="inline-flex flex-wrap items-center gap-1 rounded-md border border-dashed border-(--line) p-1"
              fields={fields}
              group={node}
              onEdit={onEdit}
              path={nodePath}
            />
          </span>
        ) : (
          <span
            key={`${String(index)}-rule`}
            className="contents"
          >
            {separator}
            <FilterPill
              field={fields.find(({ key }) => key === node.field)}
              onRemove={() => {
                onEdit(removeNode(nodePath));
              }}
              onRuleChange={(rule) => {
                onEdit(setRule(nodePath, rule));
              }}
              rule={node}
            />
          </span>
        );
      })}
      {hasParentheses && <span aria-hidden="true">)</span>}
      {!isRoot && (
        <>
          <select
            aria-label={`${name} match`}
            className="rounded-md border border-(--line) bg-(--surface-raised) px-1 text-sm"
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
          <button
            aria-label={`Remove ${name}`}
            className="rounded-md border border-(--line) px-2 text-sm"
            onClick={() => {
              onEdit(removeNode(path));
            }}
            type="button"
          >
            ×
          </button>
        </>
      )}
    </div>
  );
}
