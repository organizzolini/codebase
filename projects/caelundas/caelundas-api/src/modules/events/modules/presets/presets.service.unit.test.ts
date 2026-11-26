import { describe, expect, it } from "vitest";

import { DEFAULT_PRESET_ID, PRESETS } from "./presets.constants";
import { PresetsService } from "./presets.service";

import type { EventFacetEntity } from "../facets/event-facet.entities";

/** A tag root with a tag for each path beneath it, each id `root:path`. */
function facet(id: string, name: string, paths: string[]): EventFacetEntity {
  return {
    icon: null,
    id,
    name,
    note: null,
    slug: id,
    values: paths.map((path) => ({
      alsoUnder: [],
      count: 1,
      depth: path.split(" / ").length,
      icon: null,
      id: `${id}:${path}`,
      name: path.split(" / ").at(-1) ?? path,
      note: null,
      path,
      slug: (path.split(" / ").at(-1) ?? path).toLowerCase(),
    })),
  };
}

const service = new PresetsService();

const FACETS = [
  facet("aspect", "Aspect", ["Simple / Major"]),
  facet("body", "Body", ["Luminary / Moon", "Luminary / Sun"]),
  facet("planetary", "Planetary", ["Direction"]),
  facet("zodiac", "Zodiac", ["Ingress / Sign Ingress"]),
];

describe(PresetsService, () => {
  it("names the tags of the data in place of the names it was written with", () => {
    expect.hasAssertions();

    const [highlights] = service.resolve(FACETS);

    expect(highlights).toMatchObject({
      filter: {
        combinator: "or",
        groups: [
          {
            combinator: "and",
            rules: [
              {
                operator: "is_any_of",
                path: ["tag:aspect"],
                values: ["aspect:Simple / Major"],
              },
              {
                operator: "is_none_of",
                path: ["tag:body"],
                values: ["body:Luminary / Moon"],
              },
            ],
          },
          {
            combinator: "and",
            rules: [
              {
                operator: "is_any_of",
                path: ["tag:zodiac"],
                values: ["zodiac:Ingress / Sign Ingress"],
              },
              { path: ["tag:body"] },
            ],
          },
          {
            combinator: "or",
            rules: [
              {
                operator: "is_any_of",
                path: ["tag:planetary"],
                values: ["planetary:Direction"],
              },
            ],
          },
        ],
      },
      id: DEFAULT_PRESET_ID,
    });
  });

  it("lists the presets the data can serve, in menu order", () => {
    expect.hasAssertions();

    expect(service.resolve(FACETS).map(({ id }) => id)).toStrictEqual([
      "highlights",
      "major-aspects",
      "planetary-cycles",
    ]);
  });

  it("leaves out an and whose condition the data cannot name", () => {
    expect.hasAssertions();

    expect(
      service.resolve(FACETS.slice(0, 1)).map(({ id }) => id),
    ).not.toContain("major-aspects");
  });

  it("keeps the or's other conditions when one cannot be named", () => {
    expect.hasAssertions();

    const [highlights] = service.resolve(FACETS.slice(2, 3));

    expect(highlights?.id).toBe(DEFAULT_PRESET_ID);
    expect(highlights?.filter.groups).toHaveLength(1);
    expect(highlights?.filter.rules).toStrictEqual([]);
  });

  it("answers nothing for data that has none of the tags", () => {
    expect.hasAssertions();

    expect(service.resolve([])).toStrictEqual([]);
  });

  it("offers each preset once, with a name and a description", () => {
    expect.hasAssertions();

    const ids = PRESETS.map(({ id }) => id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain(DEFAULT_PRESET_ID);

    for (const preset of PRESETS) {
      expect(preset.name).not.toBe("");
      expect(preset.description).not.toBe("");
    }
  });
});
