import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import { serveCalendarApi } from "../../../../../../testing/calendar-api";
import { findFixtureFacets } from "../../../../../../testing/calendar-facets";
import { FIXTURE_TAGS } from "../../../../../../testing/calendar-fixture";
import { findFacets } from "../../../../calendar-display/events-calendar/components/events-api/events-api.utilities";

import {
  createEventFilterFields,
  createTagOptions,
  describeRoot,
  describeTagOption,
  listOfferedValues,
} from "./event-filter-fields.utilities";

const DERIVED_FIELDS = [
  ["date", "Date"],
  ["weekday", "Weekday"],
  ["hour", "Hour"],
  ["duration-minutes", "Duration (minutes)"],
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

// A root named like Temporality, which is a tag root like any other.
const TEMPORALITY_TAGS = MOTION_TAGS.map((tag) => ({
  ...tag,
  name: tag.name.replace("Motion", "Temporality"),
}));

describe(createEventFilterFields, () => {
  it("makes one field per tag root, valued with the tags beneath it", async () => {
    const facets = await findFixtureFacets();
    const fields = createEventFilterFields(facets);

    expect(fields.map((field) => [field.id, field.label])).toStrictEqual([
      ["tag:tag-aspect", "Aspect"],
      ["tag:tag-body", "Body"],
      ["tag:tag-element", "Element"],
      ["tag:tag-planetary", "Planetary"],
      ["tag:tag-zodiac", "Sign"],
      ...DERIVED_FIELDS,
    ]);
    expect(
      fields
        .find((field) => field.id === "tag:tag-aspect")
        ?.options?.map((option) => [option.value, option.label]),
    ).toStrictEqual([
      ["tag-simple", "Simple"],
      ["tag-major", "Major"],
      ["tag-conjunct", "Conjunct"],
      ["tag-square", "Square"],
    ]);
  });

  it("counts the events each tag matches, its descendants' included", async () => {
    const facets = await findFixtureFacets();
    const typeField = createEventFilterFields(facets).find(
      (field) => field.id === "tag:tag-aspect",
    );

    expect(
      typeField?.options
        ?.filter(
          (option) =>
            option.value === "tag-simple" || option.value === "tag-conjunct",
        )
        .map((option) => option.description),
    ).toStrictEqual(["2 events", "1 event"]);
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

  it("offers the Temporality tag root as a field, not leaving it to a derived one", async () => {
    const facets = await findFixtureFacets({ tags: TEMPORALITY_TAGS });

    expect(
      createEventFilterFields(facets)
        .filter((field) => field.label === "Temporality")
        .map((field) => field.id),
    ).toStrictEqual(["tag:tag-motion"]);
  });

  it("makes only the derived fields for an empty database", async () => {
    const facets = await findFixtureFacets({ events: [], tags: [] });

    expect(
      createEventFilterFields(facets).map((field) => [field.id, field.label]),
    ).toStrictEqual(DERIVED_FIELDS);
  });

  it("picks the tags with the checkbox editor, each indented by its depth", async () => {
    const fields = createEventFilterFields(await findFixtureFacets());
    const type = fields.find((field) => field.id === "tag:tag-aspect");

    expect(type?.editor).toBe("tag-options");
    expect(
      type?.options?.map((option) => [option.value, option.data]),
    ).toStrictEqual([
      [
        "tag-simple",
        { alsoUnder: [], depth: 0, folder: false, name: "Simple" },
      ],
      ["tag-major", { alsoUnder: [], depth: 1, folder: false, name: "Major" }],
      [
        "tag-conjunct",
        { alsoUnder: [], depth: 2, folder: false, name: "Conjunct" },
      ],
      [
        "tag-square",
        { alsoUnder: [], depth: 2, folder: false, name: "Square" },
      ],
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

    expect(describe("Body")).toContain("bodies");
    expect(describe("Element")).toBe("The element of the event");

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

  describe("tag icons and notes", () => {
    const facet = {
      icon: "globe",
      id: "tag-body",
      name: "Body",
      note: "The bodies an event involves.",
      values: [
        {
          count: 2,
          depth: 1,
          icon: "moon",
          id: "tag-moon",
          name: "Moon",
          note: "The Moon.",
          path: "Moon",
        },
        { count: 1, depth: 1, id: "tag-sun", name: "Sun", path: "Sun" },
      ],
    };

    it("describes a root by its own note before a canned one", () => {
      expect(describeRoot(facet)).toBe("The bodies an event involves.");
    });

    it("gives a tag option its icon and carries its note", () => {
      const [moon, sun] = createTagOptions(
        facet,
        listOfferedValues(facet.values),
      );

      expect(moon?.icon).toBeDefined();
      expect(moon?.data).toStrictEqual({
        alsoUnder: undefined,
        depth: 0,
        folder: false,
        name: "Moon",
        note: "The Moon.",
      });
      expect(sun?.icon).toBeDefined();
      expect(sun?.data).toStrictEqual({
        alsoUnder: undefined,
        depth: 0,
        folder: false,
        name: "Sun",
      });
    });

    it("says a tag's note before its count of events", () => {
      const [moon, sun] = createTagOptions(
        facet,
        listOfferedValues(facet.values),
      ).map((option) => describeTagOption(option));

      expect(moon).toBe("The Moon. · 2 events");
      expect(sun).toBe("1 event");
    });
  });

  describe("a tag under two parents", () => {
    const facet = {
      icon: null,
      id: "body",
      name: "Body",
      note: null,
      values: [
        {
          alsoUnder: [],
          count: 3,
          depth: 1,
          id: "benefic",
          name: "Benefic",
          path: "Benefic",
        },
        {
          alsoUnder: ["Body / Planet"],
          count: 2,
          depth: 2,
          id: "venus",
          name: "Venus",
          path: "Benefic / Venus",
        },
        {
          alsoUnder: [],
          count: 5,
          depth: 1,
          id: "planet",
          name: "Planet",
          path: "Planet",
        },
        {
          alsoUnder: ["Body / Benefic"],
          count: 2,
          depth: 2,
          id: "venus",
          name: "Venus",
          path: "Planet / Venus",
        },
        {
          alsoUnder: [],
          count: 1,
          depth: 2,
          id: "other",
          name: "Venus",
          path: "Planet / Other / Venus",
        },
      ],
    };

    it("is one option a place, with one value, and says where else it sits", () => {
      const options = createTagOptions(facet, listOfferedValues(facet.values));

      expect(options.map((option) => option.value)).toStrictEqual([
        "benefic",
        "venus",
        "planet",
        "venus",
        "other",
      ]);
      expect(options[1]?.data).toMatchObject({ alsoUnder: ["Body / Planet"] });
      expect(options[0]?.data).toMatchObject({ alsoUnder: [] });
    });

    it("leads its description with the names of its other parents", () => {
      const options = createTagOptions(facet, listOfferedValues(facet.values));

      expect(describeTagOption(options[1] as never)).toBe(
        "also Planet · 2 events",
      );
      expect(describeTagOption(options[3] as never)).toBe(
        "also Benefic · 2 events",
      );
      expect(describeTagOption(options[0] as never)).toBe("3 events");
    });

    it("marks the chip of a rule holding it, and only that", () => {
      const field = createEventFilterFields([facet]).find(
        ({ id }) => id === "tag:body",
      );
      const fewer = { ...facet, values: facet.values.slice(0, 4) };
      const options = createTagOptions(fewer, listOfferedValues(fewer.values));
      const labels = {
        selectPlaceholder: "Select...",
        valueCount: (count: number) => `${String(count)} selected`,
      };
      const show = (values: string[], picked: typeof options): void => {
        render(
          createElement(
            "div",
            { "data-testid": "chip" },
            field?.renderValue?.({
              field,
              labels,
              operator: { label: "is any of", value: "is_any_of" },
              options: picked,
              value: values,
              values,
            } as never),
          ),
        );
      };

      show([], []);

      expect(screen.getByTestId("chip").textContent).toBe("Select...");

      show(["benefic", "planet"], [options[0], options[2]] as typeof options);

      expect(screen.getAllByTestId("chip")[1]?.textContent).toBe("2 selected");

      show(["benefic"], [options[0]] as typeof options);

      expect(screen.getAllByTestId("chip")[2]?.textContent).toBe("Benefic");
      expect(screen.queryByTestId("chip-also-under")).toBeNull();

      show(["venus"], [options[1]] as typeof options);

      expect(screen.getAllByTestId("chip")[3]?.textContent).toBe("Venus");
      expect(screen.getByTestId("chip-also-under").getAttribute("title")).toBe(
        "Also under Body / Planet",
      );

      show(["gone"], []);

      expect(screen.getAllByTestId("chip")[4]?.textContent).toBe("gone");
    });

    it("keeps its plain name, and uses a path only against a different tag of that name", () => {
      const fewer = { ...facet, values: facet.values.slice(0, 4) };
      const labels = createTagOptions(
        fewer,
        listOfferedValues(fewer.values),
      ).map((option) => option.label);

      expect(labels).toStrictEqual(["Benefic", "Venus", "Planet", "Venus"]);
      expect(
        createTagOptions(facet, listOfferedValues(facet.values)).map(
          (option) => option.label,
        ),
      ).toContain("Benefic / Venus");
    });
  });

  describe("tags a menu leaves out", () => {
    const facet = {
      icon: null,
      id: "zodiac",
      name: "Sign",
      note: null,
      values: [
        {
          count: 3,
          depth: 1,
          id: "sign",
          isFilterable: false,
          name: "Sign",
          path: "Sign",
        },
        {
          count: 2,
          depth: 2,
          id: "aries",
          name: "Aries",
          path: "Sign / Aries",
        },
        {
          count: 1,
          depth: 1,
          id: "empty",
          isFilterable: false,
          name: "Empty",
          path: "Empty",
        },
        {
          count: 1,
          depth: 1,
          id: "ingress",
          name: "Ingress",
          path: "Ingress",
        },
      ],
    };

    it("lists them as folders when a tag beneath is offered, and drops them with none, for the Filter menu", () => {
      const options = createTagOptions(
        facet,
        listOfferedValues(facet.values, "isFilterable"),
      );

      expect(options.map((option) => option.value)).toStrictEqual([
        "sign",
        "aries",
        "ingress",
      ]);
      expect(options[0]?.data).toMatchObject({ folder: true });
      expect(options[1]?.data).toMatchObject({ folder: false });
    });

    it("lists every tag when no menu is named", () => {
      expect(
        createTagOptions(facet, listOfferedValues(facet.values)),
      ).toHaveLength(4);
      expect(listOfferedValues(facet.values)).toHaveLength(4);
    });
  });
});
