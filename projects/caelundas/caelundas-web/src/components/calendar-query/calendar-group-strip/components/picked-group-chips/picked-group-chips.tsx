import { Tags } from "lucide-react";
import { Fragment, use } from "react";

import { TableGroupsContext } from "../../../../calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.constants";
import { hasGroupRows } from "../../calendar-group-strip.utilities";
import { GroupLevelChip } from "../group-level-chip/group-level-chip";

import { listPickedGroups } from "./picked-group-chips.utilities";

import type { CalendarViewName } from "../../../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The view whose groups the chips stand for.
 */
export interface PickedGroupChipsProperties {
  view: CalendarViewName;
}

// 🧩 Component

/**
 * Renders a chip for each group opened by clicking it in a chart or list, in its color, whose Remove closes it again.
 */
export function PickedGroupChips(
  properties: Readonly<PickedGroupChipsProperties>,
): ReactNode {
  const { view } = properties;

  // 🪝 Hooks
  const { dispatch, state } = use(TableGroupsContext);

  // 🏗 Setup
  const groups = hasGroupRows(view) ? listPickedGroups(state) : [];

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <Fragment>
      {groups.map(({ color, id, label }) => (
        <GroupLevelChip
          key={id}
          icon={
            color === undefined ? (
              <Tags aria-hidden="true" />
            ) : (
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full"
                data-testid="picked-group-swatch"
                style={{ background: color }}
              />
            )
          }
          label={label}
          onRemove={() => {
            dispatch({ id, type: "toggle" });
          }}
        />
      ))}
    </Fragment>
  );
}
