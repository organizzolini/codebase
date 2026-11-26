import { describe, expect, it, vi } from "vitest";

import {
  clearColumnSort,
  createHeaderActions,
  getColumnSort,
  getSortDirection,
  setColumnSort,
} from "./table-column-heads.utilities";

import type { GroupSort } from "../../../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { TableColumn } from "../../calendar-table.types";

const NAME: TableColumn = { id: "name", kind: "name", label: "Name" };
const START: TableColumn = { id: "start", kind: "start", label: "Start" };
const VENUS: TableColumn = {
  id: "venus",
  kind: "tag",
  label: "Venus",
  prefix: "Venus",
};
const NUMBER: TableColumn = { id: "number", kind: "number", label: "#" };
const SORTS: GroupSort[] = [
  { direction: "asc", key: "order" },
  { direction: "desc", key: "name" },
];

describe("table column heads utilities", () => {
  describe(getColumnSort, () => {
    it("maps columns to the sorts that order by them", () => {
      expect(getColumnSort(NAME)).toStrictEqual({ key: "name" });
      expect(getColumnSort(START)).toStrictEqual({ key: "start" });
      expect(getColumnSort({ ...START, id: "end", kind: "end" })).toStrictEqual(
        {
          key: "end",
        },
      );
      expect(
        getColumnSort({
          id: "duration",
          kind: "duration",
          label: "Duration",
        }),
      ).toStrictEqual({ key: "duration" });
      expect(getColumnSort(VENUS)).toStrictEqual({ key: "tag", tag: "venus" });
      expect(getColumnSort(NUMBER)).toBeUndefined();
    });
  });

  describe(getSortDirection, () => {
    it("names the direction only for the primary sort", () => {
      expect(getSortDirection([{ direction: "desc", key: "name" }], NAME)).toBe(
        "desc",
      );
      expect(getSortDirection(SORTS, NAME)).toBeUndefined();
      expect(getSortDirection([], NAME)).toBeUndefined();
      expect(getSortDirection(SORTS, NUMBER)).toBeUndefined();
    });
  });

  describe(setColumnSort, () => {
    it("puts the column's sort first, replacing its earlier entry", () => {
      expect(setColumnSort(SORTS, NAME, "asc")).toStrictEqual([
        { direction: "asc", key: "name" },
        { direction: "asc", key: "order" },
      ]);
    });

    it("tells tags apart by their id", () => {
      expect(
        setColumnSort(
          [{ direction: "asc", key: "tag", tag: "mars" }],
          VENUS,
          "desc",
        ),
      ).toStrictEqual([
        { direction: "desc", key: "tag", tag: "venus" },
        { direction: "asc", key: "tag", tag: "mars" },
      ]);
    });

    it("leaves the sorts for a column that cannot sort", () => {
      expect(setColumnSort(SORTS, NUMBER, "asc")).toStrictEqual(SORTS);
    });
  });

  describe(clearColumnSort, () => {
    it("drops the column's sort", () => {
      expect(clearColumnSort(SORTS, NAME)).toStrictEqual([
        { direction: "asc", key: "order" },
      ]);
    });

    it("gives nothing when none are left", () => {
      expect(
        clearColumnSort([{ direction: "asc", key: "name" }], NAME),
      ).toBeUndefined();
    });

    it("keeps the sorts for a column that cannot sort", () => {
      expect(clearColumnSort(SORTS, NUMBER)).toStrictEqual(SORTS);
    });
  });

  describe(createHeaderActions, () => {
    const ids = ["name", "start", "venus"];

    it("moves and deselects with explicit ids", () => {
      const onColumnsChange = vi.fn();
      const actions = createHeaderActions(START, {
        ids,
        onColumnsChange,
        sort: [],
      });

      actions.onMoveLeft?.();
      actions.onMoveRight?.();
      actions.onRemove?.();

      expect(onColumnsChange.mock.calls).toStrictEqual([
        [["start", "name", "venus"]],
        [["name", "venus", "start"]],
        [["name", "venus"]],
      ]);
    });

    it("disables moving past the ends and removing the last column", () => {
      const first = createHeaderActions(NAME, {
        ids,
        onColumnsChange: vi.fn(),
        sort: [],
      });
      const last = createHeaderActions(VENUS, {
        ids,
        onColumnsChange: vi.fn(),
        sort: [],
      });
      const only = createHeaderActions(NAME, {
        ids: ["name"],
        onColumnsChange: vi.fn(),
        sort: [],
      });

      expect(first.onMoveLeft).toBeUndefined();
      expect(last.onMoveRight).toBeUndefined();
      expect(only.onRemove).toBeUndefined();
    });

    it("sorts and clears through the handler", () => {
      const onSortChange = vi.fn();
      const actions = createHeaderActions(NAME, {
        ids,
        onSortChange,
        sort: [{ direction: "asc", key: "name" }],
      });

      actions.onSort?.("desc");
      actions.onClearSort?.();

      expect(onSortChange.mock.calls).toStrictEqual([
        [[{ direction: "desc", key: "name" }]],
        [undefined],
      ]);
    });

    it("offers no clear sort for a column that does not lead the sorts", () => {
      const actions = createHeaderActions(NAME, {
        ids,
        onSortChange: vi.fn(),
        sort: [],
      });

      expect(actions.onClearSort).toBeUndefined();
      expect(actions.onSort).toBeDefined();
    });

    it("offers nothing without handlers or for a position column", () => {
      expect(createHeaderActions(NAME, { ids, sort: [] })).toStrictEqual({});
      expect(
        createHeaderActions(NUMBER, {
          ids,
          onColumnsChange: vi.fn(),
          onSortChange: vi.fn(),
          sort: [],
        }),
      ).toStrictEqual({});
    });
  });
});
