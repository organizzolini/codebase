import { describe, expect, it } from "vitest";

import { findMatchingEventIds } from "../../../testing/event-filters";
import { createTestEventsDatabase } from "../../../testing/events-database";

import {
  DEFAULT_EVENT_FILTER_COLLECTION_ID,
  EVENT_FILTER_COLLECTIONS,
  resolveEventFilterCollection,
  resolveEventFilterCollections,
} from "./event-filter-collections";

import type { EventFacet } from "../events-database/events-database.types";

function facet(id: string, name: string, paths: string[]): EventFacet {
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
    "Station",
  ]),
  facet("planet", "Planet", ["Moon", "Sun"]),
];

function getCollection(id: string): (typeof EVENT_FILTER_COLLECTIONS)[number] {
  const collection = EVENT_FILTER_COLLECTIONS.find(
    (candidate) => candidate.id === id,
  );

  if (collection === undefined) {
    throw new Error(`No collection ${id}`);
  }

  return collection;
}

describe("event filter collections", () => {
  describe(resolveEventFilterCollection, () => {
    it("names the tags of the data in place of the names it was written with", () => {
      const resolved = resolveEventFilterCollection(
        getCollection(DEFAULT_EVENT_FILTER_COLLECTION_ID),
        FACETS,
      );

      expect(resolved?.filter).toMatchObject({
        combinator: "or",
        rules: [
          {
            combinator: "and",
            rules: [
              {
                operator: "is_any_of",
                path: ["tag:type"],
                value: [
                  "type:Aspect / Simple Aspect / Major Aspect",
                  "type:Ingress / Sign Ingress",
                ],
              },
              {
                operator: "is_none_of",
                path: ["tag:planet"],
                value: ["planet:Moon"],
              },
            ],
          },
          {
            operator: "is_any_of",
            path: ["tag:type"],
            value: ["type:Station"],
          },
        ],
      });
    });

    it("leaves out an and whose condition the data cannot name", () => {
      const resolved = resolveEventFilterCollection(
        getCollection("major-aspects"),
        FACETS.slice(0, 1),
      );

      expect(resolved).toBeNull();
    });

    it("keeps the or's other conditions when one cannot be named", () => {
      const resolved = resolveEventFilterCollection(
        getCollection(DEFAULT_EVENT_FILTER_COLLECTION_ID),
        FACETS.slice(0, 1),
      );

      expect(resolved?.filter.rules).toHaveLength(1);
    });

    it("answers nothing for data that has none of the tags", () => {
      expect(
        resolveEventFilterCollection(getCollection("daily-cycles"), []),
      ).toBeNull();
    });

    it("filters the events of a real database through the tags it names", async () => {
      const facets = await createTestEventsDatabase().findFacets();
      const resolved = resolveEventFilterCollection(
        getCollection("planet-sign-events"),
        facets,
      );

      expect(resolved).not.toBeNull();
      await expect(
        findMatchingEventIds(resolved?.filter as never),
      ).resolves.toStrictEqual([
        "event-sun-ingress-aries",
        "event-sun-ingress-cancer",
        "event-venus-ingress-aries",
      ]);
    });
  });

  describe(resolveEventFilterCollections, () => {
    it("lists the collections the data can serve, in menu order", () => {
      expect(
        resolveEventFilterCollections(FACETS).map(
          (collection) => collection.id,
        ),
      ).toStrictEqual(["highlights", "major-aspects", "planetary-cycles"]);
    });

    it("offers each collection once, with a name and a description", () => {
      const ids = EVENT_FILTER_COLLECTIONS.map((collection) => collection.id);

      expect(new Set(ids).size).toBe(ids.length);
      expect(ids).toContain(DEFAULT_EVENT_FILTER_COLLECTION_ID);

      for (const collection of EVENT_FILTER_COLLECTIONS) {
        expect(collection.name).not.toBe("");
        expect(collection.description).not.toBe("");
      }
    });
  });
});
