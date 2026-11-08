import { describe, expect, it } from "vitest";

import {
  DEFAULT_EVENT_FILTER_COLLECTION_ID,
  EVENT_FILTER_COLLECTIONS,
} from "./event-filter-collections.constants";
import { resolveEventFilterCollections } from "./event-filter-collections.utilities";

import type { EventFacetEntity } from "./event-facet.entities";

/** A tag root with a tag for each path beneath it, each id `root:path`. */
function facet(id: string, name: string, paths: string[]): EventFacetEntity {
  return {
    id,
    name,
    values: paths.map((path) => ({
      count: 1,
      depth: path.split(" / ").length,
      id: `${id}:${path}`,
      name: path.split(" / ").at(-1) ?? path,
      path,
    })),
  };
}

const FACETS = [
  facet("type", "Type", [
    "Aspect / Simple Aspect / Major Aspect",
    "Ingress / Sign Ingress",
    "Direction",
  ]),
  facet("planet", "Planet", ["Moon", "Sun"]),
];

describe(resolveEventFilterCollections, () => {
  it("names the tags of the data in place of the names it was written with", () => {
    expect.hasAssertions();

    const [highlights] = resolveEventFilterCollections(FACETS);

    expect(highlights).toMatchObject({
      filter: {
        combinator: "or",
        groups: [
          {
            combinator: "and",
            groups: [],
            rules: [
              {
                operator: "is_any_of",
                path: ["tag:type"],
                values: [
                  "type:Aspect / Simple Aspect / Major Aspect",
                  "type:Ingress / Sign Ingress",
                ],
              },
              {
                operator: "is_none_of",
                path: ["tag:planet"],
                values: ["planet:Moon"],
              },
            ],
          },
        ],
        rules: [
          {
            operator: "is_any_of",
            path: ["tag:type"],
            values: ["type:Direction"],
          },
        ],
      },
      id: DEFAULT_EVENT_FILTER_COLLECTION_ID,
    });
  });

  it("lists the collections the data can serve, in menu order", () => {
    expect.hasAssertions();

    expect(
      resolveEventFilterCollections(FACETS).map(({ id }) => id),
    ).toStrictEqual(["highlights", "major-aspects", "planetary-cycles"]);
  });

  it("leaves out an and whose condition the data cannot name", () => {
    expect.hasAssertions();

    expect(
      resolveEventFilterCollections(FACETS.slice(0, 1)).map(({ id }) => id),
    ).not.toContain("major-aspects");
  });

  it("keeps the or's other conditions when one cannot be named", () => {
    expect.hasAssertions();

    const [highlights] = resolveEventFilterCollections(FACETS.slice(0, 1));

    expect(highlights?.id).toBe(DEFAULT_EVENT_FILTER_COLLECTION_ID);
    expect(highlights?.filter.groups).toStrictEqual([]);
    expect(highlights?.filter.rules).toHaveLength(1);
  });

  it("answers nothing for data that has none of the tags", () => {
    expect.hasAssertions();

    expect(resolveEventFilterCollections([])).toStrictEqual([]);
  });

  it("offers each collection once, with a name and a description", () => {
    expect.hasAssertions();

    const ids = EVENT_FILTER_COLLECTIONS.map(({ id }) => id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain(DEFAULT_EVENT_FILTER_COLLECTION_ID);

    for (const collection of EVENT_FILTER_COLLECTIONS) {
      expect(collection.name).not.toBe("");
      expect(collection.description).not.toBe("");
    }
  });
});
