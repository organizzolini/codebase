import { describe, expect, it } from "vitest";

import { createTestEventsDatabase } from "../../../testing/events-database";

import { createEventFilterFields } from "./event-filter-fields";

const DERIVED_FIELDS = [
  ["date", "Date"],
  ["weekday", "Weekday"],
  ["hour", "Hour"],
  ["duration", "Duration"],
  ["duration-minutes", "Duration (minutes)"],
  ["temporality", "Temporality"],
  ["text", "Text"],
];

// A dimension the seed does not have, added the way a new export would add
// it: as rows, with no change to the app.
const MOTION_ROOT_SQL = `
  insert into tags (id, created_at, updated_at, "name", parent_id) values
    ('tag-motion', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Motion', null),
    ('tag-direct', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Direct', 'tag-motion');
  insert into tags_closure (ancestor_id, descendant_id) values
    ('tag-motion', 'tag-motion'),
    ('tag-direct', 'tag-direct'),
    ('tag-motion', 'tag-direct');
`;

// A root whose tags are named for the numbers they stand for.
const HARMONIC_ROOT_SQL = `
  insert into tags (id, created_at, updated_at, "name", parent_id) values
    ('tag-harmonic', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Aspect Harmonic', null),
    ('tag-harmonic-4', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 'Harmonic 4', 'tag-harmonic');
  insert into tags_closure (ancestor_id, descendant_id) values
    ('tag-harmonic', 'tag-harmonic'),
    ('tag-harmonic-4', 'tag-harmonic-4'),
    ('tag-harmonic', 'tag-harmonic-4');
`;

// A root that names a dimension the app already derives from each event.
const TEMPORALITY_ROOT_SQL = MOTION_ROOT_SQL.replaceAll(
  "Motion",
  "Temporality",
);

describe(createEventFilterFields, () => {
  it("makes one field per tag root, valued with the tags beneath it", async () => {
    const facets = await createTestEventsDatabase().findFacets();
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
    const facets = await createTestEventsDatabase().findFacets();
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
    const facets = await createTestEventsDatabase().findFacets();
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
    const facets = await createTestEventsDatabase({
      extraSql: HARMONIC_ROOT_SQL,
    }).findFacets();
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
    const fields = createEventFilterFields(
      await createTestEventsDatabase().findFacets(),
    );

    for (const id of ["hour", "duration-minutes"]) {
      expect(fields.find((field) => field.id === id)?.type).toBe("number");
    }
  });

  it("adds a field for a new tag root with no code change", async () => {
    const facets = await createTestEventsDatabase({
      extraSql: MOTION_ROOT_SQL,
    }).findFacets();

    expect(
      createEventFilterFields(facets).find((field) => field.label === "Motion")
        ?.options,
    ).toStrictEqual([
      expect.objectContaining({ description: "0 events", value: "tag-direct" }),
    ]);
  });

  it("leaves a tag root named like a derived field to the derived one", async () => {
    const facets = await createTestEventsDatabase({
      extraSql: TEMPORALITY_ROOT_SQL,
    }).findFacets();

    expect(
      createEventFilterFields(facets)
        .filter((field) => field.label === "Temporality")
        .map((field) => field.id),
    ).toStrictEqual(["temporality"]);
  });

  it("makes only the derived fields for an empty database", async () => {
    const facets = await createTestEventsDatabase({ empty: true }).findFacets();

    expect(
      createEventFilterFields(facets).map((field) => [field.id, field.label]),
    ).toStrictEqual(DERIVED_FIELDS);
  });

  it("picks the tags with the checkbox editor, each indented by its depth", async () => {
    const fields = createEventFilterFields(
      await createTestEventsDatabase().findFacets(),
    );
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
    const database = createTestEventsDatabase();
    const march = await database.findFacets({
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
});
