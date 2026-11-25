import type {
  PickedGroup,
  TableGroupsState,
} from "../../../../calendar-display/calendar-table/components/table-groups-provider/table-groups-provider.types";

// 🌎 Public Functions

/**
 * The groups opened by name that the layout still holds, in the order they were opened.
 */
export function listPickedGroups(
  state: Pick<TableGroupsState, "groupIds" | "picked">,
): PickedGroup[] {
  return state.picked.filter((group) => state.groupIds.includes(group.id));
}
