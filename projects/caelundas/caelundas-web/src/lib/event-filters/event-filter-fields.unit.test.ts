import { describe, expect, it } from "vitest";

import { createTestEventsDatabase } from "../../../testing/events-database";

import { createEventFilterFields } from "./event-filter-fields";

const DERIVED_FIELDS = [
  ["date", "Date"],
  ["weekday", "Weekday"],
  ["hour", "Hour"],
  ["duration", "Duration"],
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
      ["tag-major-aspect", "Aspect / Major Aspect"],
      ["tag-conjunct", "Aspect / Major Aspect / Conjunct"],
      ["tag-square", "Aspect / Major Aspect / Square"],
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
});
