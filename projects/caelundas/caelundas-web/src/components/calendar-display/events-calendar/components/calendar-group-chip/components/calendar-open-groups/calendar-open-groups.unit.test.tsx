import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createRecord } from "../../../../../../../../testing/calendar/calendar-records";
import { groupCalendarEvents } from "../../../calendar-groups/calendar-groups.utilities";

import { CalendarOpenGroups } from "./calendar-open-groups";
import { getSubGroups } from "./calendar-open-groups.utilities";

import type { EventGrouping } from "../../../../../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { CalendarEventRecord } from "../../../calendar-loader/calendar-records.types";

const DAY = "2026-03-03T10:00:00Z";
// A grouping the link names: two levels, the second by sign.
const PICKED = [{ field: "tag:aspect" }, { field: "tag:sign" }];
// The default grouping lists a level per depth beneath the roots, though events carry a key at the first only.
const DEFAULT = [
  { field: "tag:*", tags: ["a"] },
  { field: "tag:b" },
  { field: "tag:c" },
];
const SORT = { ranks: undefined, roots: undefined, sorts: undefined };

function nest(id: string, sub?: string): CalendarEventRecord {
  const record = createRecord(id, DAY, DAY, ["Aspect"]);

  return {
    ...record,
    groups: [
      ...record.groups,
      sub === undefined
        ? []
        : [{ key: `sub-${sub}`, label: sub, path: sub, rank: sub }],
    ],
  };
}

const EVENTS = [nest("a", "Fire"), nest("b", "Fire"), nest("c", "Earth")];

function renderGroups(
  events: readonly CalendarEventRecord[],
  grouping: EventGrouping,
  allOpen: boolean,
): void {
  render(
    <CalendarOpenGroups
      allOpen={allOpen}
      day="2026-03-03"
      grouping={grouping}
      groups={groupCalendarEvents(events, { grouping })}
      timeZone="UTC"
    />,
  );
}

describe(CalendarOpenGroups, () => {
  it("opens a group as a card, its subgroups nested inside, each opening in turn", () => {
    renderGroups(EVENTS, PICKED, false);

    const [header] = screen.getAllByRole("button");

    expect(header?.getAttribute("aria-expanded")).toBe("false");

    if (header !== undefined) {
      fireEvent.click(header);
    }

    const card = screen.getAllByTestId("calendar-group-card")[0];

    expect(
      within(card ?? document.body).getAllByTestId("calendar-group-card"),
    ).toHaveLength(2);
    expect(screen.queryAllByTestId("calendar-event-chip")).toHaveLength(0);
  });

  it("starts every group open when asked, each still closing from its header", () => {
    renderGroups(EVENTS, PICKED, true);

    expect(screen.getAllByTestId("calendar-event-chip")).toHaveLength(3);

    const [header] = screen.getAllByRole("button");

    if (header !== undefined) {
      fireEvent.click(header);
    }

    expect(screen.queryAllByTestId("calendar-event-chip")).toHaveLength(0);
  });

  it("nests no level of the default grouping: the events sit directly in the card", () => {
    renderGroups(EVENTS, DEFAULT, true);

    expect(screen.getAllByTestId("calendar-group-card")).toHaveLength(1);
    expect(screen.getAllByTestId("calendar-event-chip")).toHaveLength(3);
    expect(screen.queryByText("Other")).toBeNull();
  });

  it("draws no chain of Other cards when no event has a key at a level", () => {
    renderGroups(
      [nest("a"), nest("b")],
      [...PICKED, { field: "tag:body" }],
      true,
    );

    expect(screen.getAllByTestId("calendar-group-card")).toHaveLength(1);
    expect(screen.queryByText("Other")).toBeNull();
  });

  it("keeps an Other group beside a real one", () => {
    renderGroups([nest("a", "Fire"), nest("b")], PICKED, true);

    expect(screen.getAllByTestId("calendar-group-card")).toHaveLength(3);
    expect(screen.getByText("Other")).toBeDefined();
  });

  describe(getSubGroups, () => {
    const options = {
      colors: undefined,
      grouping: PICKED,
      level: 0,
      sort: SORT,
    };

    it("is the groups of the next level that splits the events, none at the last", () => {
      const [group] = groupCalendarEvents(EVENTS, { grouping: PICKED });

      if (group === undefined) {
        throw new Error("A group is expected.");
      }

      expect(
        getSubGroups(group, options).groups.map((sub) => sub.label),
      ).toStrictEqual(["Earth", "Fire"]);
      expect(
        getSubGroups(group, { ...options, level: 1 }).groups,
      ).toStrictEqual([]);
      expect(
        getSubGroups(group, { ...options, grouping: undefined }).groups,
      ).toStrictEqual([]);
      expect(
        getSubGroups(group, { ...options, grouping: DEFAULT }).groups,
      ).toStrictEqual([]);
    });

    it("skips a level with no keyed group for the one past it", () => {
      const [group] = groupCalendarEvents([nest("a", "Fire")], {
        grouping: PICKED,
      });
      const skipped = [
        PICKED[0] ?? { field: "tag:aspect" },
        { field: "tag:none" },
        { field: "tag:sign" },
      ];

      if (group === undefined) {
        throw new Error("A group is expected.");
      }

      const keyed = {
        ...group,
        events: group.events.map((event) => ({
          ...event,
          groups: [event.groups[0] ?? [], [], event.groups[1] ?? []],
        })),
      };
      const result = getSubGroups(keyed, { ...options, grouping: skipped });

      expect(result.level).toBe(2);
      expect(result.groups.map((sub) => sub.label)).toStrictEqual(["Fire"]);
    });
  });
});
