import { describe, expect, it } from "vitest";

import { createTestEventsDatabase } from "../../../testing/events-database";

import {
  createEventGroupFields,
  getDefaultGrouping,
  resolveEventGrouping,
} from "./event-group-fields";

const fields = createEventGroupFields(
  await createTestEventsDatabase().findFacets(),
);

describe("event group fields", () => {
  describe(createEventGroupFields, () => {
    it("offers each tag root with the names at each depth, then the derived fields", () => {
      expect(fields.map(({ id }) => id)).toStrictEqual([
        "tag:tag-element",
        "tag:tag-planet",
        "tag:tag-sign",
        "tag:tag-type",
        "year",
        "quarter",
        "month",
        "week",
        "day",
        "weekday",
        "hour",
        "duration",
      ]);
      expect(
        fields.find(({ id }) => id === "tag:tag-type")?.levels,
      ).toStrictEqual([
        ["Aspect", "Ingress", "Retrograde"],
        ["Major Aspect"],
        ["Conjunct", "Square"],
      ]);
    });
  });

  describe(getDefaultGrouping, () => {
    it.each([
      { expected: [{ depth: 1, field: "tag:tag-type" }], view: "agenda" },
      {
        expected: [
          { depth: 1, field: "tag:tag-type" },
          { depth: 1, field: "tag:tag-planet" },
        ],
        view: "timeline",
      },
      { expected: [], view: "month" },
    ])(
      "groups the $view by default as the data allows",
      ({ expected, view }) => {
        expect(getDefaultGrouping(view, fields)).toStrictEqual(expected);
      },
    );
  });

  describe(resolveEventGrouping, () => {
    it("drops fields the data lacks and repeats, and caps the levels", () => {
      expect(
        resolveEventGrouping(
          [
            { field: "tag:tag-moon" },
            { field: "month" },
            { field: "month" },
            { depth: 1, field: "tag:tag-planet" },
            { field: "hour" },
            { field: "year" },
          ],
          fields,
        ),
      ).toStrictEqual([
        { field: "month" },
        { depth: 1, field: "tag:tag-planet" },
        { field: "hour" },
      ]);
    });

    it("brings a tag level's depth within its root's tree", () => {
      expect(
        resolveEventGrouping(
          [
            { depth: 9, field: "tag:tag-type" },
            { depth: 2, field: "day" },
          ],
          fields,
        ),
      ).toStrictEqual([{ depth: 3, field: "tag:tag-type" }, { field: "day" }]);
    });

    it("keeps the tags a level picks that its root has, in place of a depth", () => {
      expect(
        resolveEventGrouping(
          [
            {
              depth: 2,
              field: "tag:tag-type",
              tags: ["tag-aspect", "tag-aspect", "tag-gone"],
            },
            { field: "month", tags: ["tag-aspect"] },
          ],
          fields,
        ),
      ).toStrictEqual([
        { field: "tag:tag-type", tags: ["tag-aspect"] },
        { field: "month" },
      ]);
    });

    it("falls back to the depth when none of the picked tags exist", () => {
      expect(
        resolveEventGrouping(
          [{ field: "tag:tag-type", tags: ["tag-gone"] }],
          fields,
        ),
      ).toStrictEqual([{ depth: 1, field: "tag:tag-type" }]);
    });
  });
});
