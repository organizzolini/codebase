import { ListTree, X } from "lucide-react";
import { createElement } from "react";

import { Button } from "@codebase/presentation";

import { LibraryOptionMenu } from "../library-toolbar/library-option-menu";

import {
  LIBRARY_GROUP_DETAILS,
  LIBRARY_GROUP_FIELDS,
  LIBRARY_GROUP_MENU_OPTIONS,
} from "./library-group.constants";
import { describeGroup, toggleGroup } from "./library-group.utilities";

import type { LibraryGroupField } from "../../../graphql/generated/operations";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The active groups, outermost first, and what to call when they change.
 */
export interface LibraryGroupProperties {
  className?: string;
  groups?: readonly LibraryGroupField[] | undefined;
  onGroups: (groups: LibraryGroupField[]) => void;
}

// 🧩 Component

/**
 * The Group button with its searchable checklist of attributes, joined to a segment for each active level in order. Checking an attribute adds a level; a segment's cross removes it.
 */
export function LibraryGroup(
  properties: Readonly<LibraryGroupProperties>,
): ReactNode {
  const { className, groups = [], onGroups } = properties;

  // 🪝 Hooks

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="library-group"
    >
      <LibraryOptionMenu
        icon={ListTree}
        label="Group"
        onToggle={(value) => {
          const field = LIBRARY_GROUP_FIELDS.get(value);
          if (field !== undefined) {
            onGroups(toggleGroup(groups, field));
          }
        }}
        options={LIBRARY_GROUP_MENU_OPTIONS}
        selected={new Set<string>(groups)}
        title="Group by"
      >
        {groups.map((field) => {
          const label = describeGroup(field);
          const icon = LIBRARY_GROUP_DETAILS.get(field)?.icon;

          return (
            <Button
              key={field}
              aria-label={`Remove grouping by ${label}`}
              data-testid="library-group-segment"
              onClick={() => {
                onGroups(toggleGroup(groups, field));
              }}
              type="button"
              variant="outline"
            >
              {icon === undefined
                ? null
                : createElement(icon, { "aria-hidden": true })}
              {label}
              <X aria-hidden="true" />
            </Button>
          );
        })}
      </LibraryOptionMenu>
    </div>
  );
}
