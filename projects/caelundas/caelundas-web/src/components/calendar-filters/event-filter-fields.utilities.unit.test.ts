import { describe, expect, it } from "vitest";

import { serveCalendarApi } from "../../../testing/calendar-api";
import { findFixtureFacets } from "../../../testing/calendar-facets";
import { FIXTURE_TAGS } from "../../../testing/calendar-fixture";
import { findFacets } from "../events-calendar/events-api.utilities";

import { createEventFilterFields } from "./event-filter-fields.utilities";

const DERIVED_FIELDS = [
  ["date", "Date"],
  ["weekday", "Weekday"],
  ["hour", "Hour"],
  ["duration", "Duration"],
  ["duration-minutes", "Duration (minutes)"],
  ["temporality", "Temporality"],
  ["text", "Text"],
];

// A dimension the fixture does not have, added the way a new export would add
// it: as tags, with no change to the app.
const MOTION_TAGS = [
  ...FIXTURE_TAGS,
  { id: "tag-motion", name: "Motion", parentId: null },
  { id: "tag-direct", name: "Direct", parentId: "tag-motion" },
];

// A root whose tags are named for the numbers they stand for.
const HARMONIC_TAGS = [
  ...FIXTURE_TAGS,
  { id: "tag-harmonic", name: "Aspect Harmonic", parentId: null },
  { id: "tag-harmonic-4", name: "Harmonic 4", parentId: "tag-harmonic" },
];

// A root that names a dimension the app already derives from each event.
const TEMPORALITY_TAGS = MOTION_TAGS.map((tag) => ({
  ...tag,
  name: tag.name.replace("Motion", "Temporality"),
}));

describe(createEventFilterFields, () => {
  it("makes one field per tag root, valued with the tags beneath it", async () => {
    const facets = await findFixtureFacets();
    const fields = createEventFilterFields(facets);

    expect(fields.map((field) => [field.id, field.label])).toStrictEqual([
      ["tag:tag-element", "Element"],
      ["tag:tag-planet", "Planet"],
      ["tag:tag-sign", "Sign"],
      ["tag:tag-type", "Type"],
      ...DERIVED_FIELDS,
    ]);
    expect(
      fields
        .find((field) => field.id === "tag:tag-type")
        ?.options?.map((option) => [option.value, option.label]),
    ).toStrictEqual([
      ["tag-aspect", "Aspect"],
      ["tag-major-aspect", "Major Aspect"],
      ["tag-conjunct", "Conjunct"],
      ["tag-square", "Square"],
      ["tag-ingress", "Ingress"],
      ["tag-retrograde", "Retrograde"],
    ]);
  });

  it("counts the events each tag matches, its descendants' included", async () => {
    const facets = await findFixtureFacets();
    const typeField = createEventFilterFields(facets).find(
      (field) => field.id === "tag:tag-type",
    );

    expect(
      typeField?.options
        ?.filter(
          (option) =>
            option.value === "tag-aspect" || option.value === "tag-ingress",
        )
        .map((option) => option.description),
    ).toStrictEqual(["2 events", "3 events"]);
  });

  it("offers is any of, has all of, and is none of on a tag field", async () => {
    const facets = await findFixtureFacets();
    const [field] = createEventFilterFields(facets);
    const operators =
      typeof field?.operators === "function" ? [] : (field?.operators ?? []);

    expect(operators.map((operator) => operator.label)).toStrictEqual([
      "is any of",
      "has all of",
      "is none of",
    ]);
  });

  it("offers a number field for a root whose tags are named for numbers", async () => {
    const facets = await findFixtureFacets({ tags: HARMONIC_TAGS });
    const field = createEventFilterFields(facets).find(
      (candidate) => candidate.label === "Aspect Harmonic",
    );

    expect(field).toMatchObject({ id: "tag:tag-harmonic", type: "number" });
    expect(field?.operators).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "equals", value: "eq" }),
        expect.objectContaining({ label: "is greater than", value: "gt" }),
        expect.objectContaining({ label: "is less than", value: "lt" }),
      ]),
    );
  });

  it("offers the hour and the duration in minutes as numbers", async () => {
    const fields = createEventFilterFields(await findFixtureFacets());

    for (const id of ["hour", "duration-minutes"]) {
      expect(fields.find((field) => field.id === id)?.type).toBe("number");
    }
  });

  it("adds a field for a new tag root with no code change", async () => {
    const facets = await findFixtureFacets({ tags: MOTION_TAGS });

    expect(
      createEventFilterFields(facets).find((field) => field.label === "Motion")
        ?.options,
    ).toStrictEqual([
      expect.objectContaining({ description: "0 events", value: "tag-direct" }),
    ]);
  });

  it("leaves a tag root named like a derived field to the derived one", async () => {
    const facets = await findFixtureFacets({ tags: TEMPORALITY_TAGS });

    expect(
      createEventFilterFields(facets)
        .filter((field) => field.label === "Temporality")
        .map((field) => field.id),
    ).toStrictEqual(["temporality"]);
  });

  it("makes only the derived fields for an empty database", async () => {
    const facets = await findFixtureFacets({ events: [], tags: [] });

    expect(
      createEventFilterFields(facets).map((field) => [field.id, field.label]),
    ).toStrictEqual(DERIVED_FIELDS);
  });

  it("picks the tags with the checkbox editor, each indented by its depth", async () => {
    const fields = createEventFilterFields(await findFixtureFacets());
    const type = fields.find((field) => field.id === "tag:tag-type");

    expect(type?.editor).toBe("tag-options");
    expect(
      type?.options?.map((option) => [option.value, option.data]),
    ).toStrictEqual([
      ["tag-aspect", { depth: 0, name: "Aspect" }],
      ["tag-major-aspect", { depth: 1, name: "Major Aspect" }],
      ["tag-conjunct", { depth: 2, name: "Conjunct" }],
      ["tag-square", { depth: 2, name: "Square" }],
      ["tag-ingress", { depth: 0, name: "Ingress" }],
      ["tag-retrograde", { depth: 0, name: "Retrograde" }],
    ]);
  });

  it("tells two tags of one name apart by their paths", () => {
    const [field] = createEventFilterFields([
      {
        id: "phase",
        name: "Phase",
        values: [
          { count: 1, depth: 1, id: "a", name: "Mercurian", path: "Mercurian" },
          {
            count: 1,
            depth: 2,
            id: "b",
            name: "Evening Set",
            path: "Mercurian / Evening Set",
          },
          { count: 1, depth: 1, id: "c", name: "Venusian", path: "Venusian" },
          {
            count: 1,
            depth: 2,
            id: "d",
            name: "Evening Set",
            path: "Venusian / Evening Set",
          },
        ],
      },
    ]);

    expect(field?.options?.map((option) => option.label)).toStrictEqual([
      "Mercurian",
      "Mercurian / Evening Set",
      "Venusian",
      "Venusian / Evening Set",
    ]);
  });

  it("counts each tag's events in the window the facets were read for", async () => {
    serveCalendarApi();

    const march = await findFacets({
      end: new Date("2026-03-06T00:00:00.000Z"),
      start: new Date("2026-03-03T00:00:00.000Z"),
    });
    const counts = Object.fromEntries(
      march
        .flatMap((facet) => facet.values)
        .map((value) => [value.id, value.count]),
    );

    // The seed's Mars conjunct Venus is on 4 March; the retrograde runs from
    // 26 February to 20 March, so it overlaps too.
    expect(counts["tag-conjunct"]).toBe(1);
    expect(counts["tag-retrograde"]).toBe(1);
    expect(counts["tag-square"]).toBe(0);
    expect(counts["tag-ingress"]).toBe(0);
  });

  it("describes every field, those of the data's roots and the derived ones", async () => {
    const fields = createEventFilterFields(
      await findFixtureFacets({ tags: MOTION_TAGS }),
    );

    for (const field of fields) {
      expect([field.label, Boolean(field.description)]).toStrictEqual([
        field.label,
        true,
      ]);
    }
  });

  it("describes a known root in its own words and a new one by its name", async () => {
    const fields = createEventFilterFields(
      await findFixtureFacets({ tags: MOTION_TAGS }),
    );
    const describe = (label: string): string | undefined =>
      fields.find((field) => field.label === label)?.description;

    expect(describe("Planet")).toContain("planets");
    expect(describe("Element")).toContain("fire");

    // Motion is a root the app knows too; a root it does not know is described
    // from its name.
    const [unknown] = createEventFilterFields([
      {
        id: "x",
        name: "Zodiacal Thing",
        values: [{ count: 0, depth: 1, id: "y", name: "Y", path: "Y" }],
      },
    ]);

    expect(unknown?.description).toBe("The zodiacal thing of the event");
  });
});
