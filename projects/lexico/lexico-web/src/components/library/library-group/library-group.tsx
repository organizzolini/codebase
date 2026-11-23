import { ListTree } from "lucide-react";

import { LibraryChip } from "../../library-strip/library-chip/library-chip";
import { moveValue } from "../../library-strip/library-chip/library-chip.utilities";
import { LibraryOptionMenu } from "../library-toolbar/library-option-menu";

import {
  LIBRARY_GROUP_DETAILS,
  LIBRARY_GROUP_FIELDS,
  LIBRARY_GROUP_MENU_OPTIONS,
} from "./library-group.constants";
import {
  describeGroup,
  reorderGroups,
  toggleGroup,
} from "./library-group.utilities";

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
 * The Group button with its searchable checklist of attributes, joined to a chip for each active level in order. Checking an attribute adds a level; a chip's menu moves it left or right, or removes it.
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
        selected={groups}
        title="Group by"
      >
        {groups.map((field, index) => {
          const label = describeGroup(field);

          return (
            <LibraryChip
              key={field}
              icon={LIBRARY_GROUP_DETAILS.get(field)?.icon}
              isFirst={index === 0}
              isLast={index === groups.length - 1}
              label={label}
              onMove={(offset) => {
                onGroups(
                  reorderGroups(groups, moveValue(groups, index, offset)),
                );
              }}
              onRemove={() => {
                onGroups(toggleGroup(groups, field));
              }}
            />
          );
        })}
      </LibraryOptionMenu>
    </div>
  );
}
