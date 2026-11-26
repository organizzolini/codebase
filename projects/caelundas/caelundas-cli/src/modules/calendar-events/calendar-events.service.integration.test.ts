import moment from "moment-timezone";
import { In, Like } from "typeorm";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  CaelundasDatabaseService,
  CalendarEvent,
  Tag,
} from "@codebase/caelundas-db";
import { LoggerModule } from "@codebase/observability";

import {
  DATABASE_TIMEOUT_MILLISECONDS,
  startCaelundasDatabase,
} from "../../../testing/support/database";
import { findStoredEvents } from "../../../testing/support/stored-events.utilities";
import { tagRepository } from "../../../testing/support/tag-repository";
import { TagsService } from "../tags/tags.service";
import { classifyEvent, tagSlug } from "../tags/tags.utilities";

import { CALENDAR_EVENT_BATCH_SIZE } from "./calendar-events.constants";
import { CalendarEventsModule } from "./calendar-events.module";
import { CalendarEventsService } from "./calendar-events.service";

import type { DetectedCalendarEvent } from "./calendar-events.types";
import type { DatabaseTestingModule } from "@codebase/persistence/testing";
import type { Repository } from "typeorm";

const philadelphia = {
  latitude: 39.949_309,
  longitude: -75.171_69,
  timezone: "America/New_York",
};
const sydney = {
  latitude: -33.8688,
  longitude: 151.2093,
  timezone: "Australia/Sydney",
};

function event(
  summary: string,
  start: string,
  end = start,
): DetectedCalendarEvent {
  return {
    description: `${summary} description`,
    end: moment.utc(end),
    start: moment.utc(start),
    summary,
    tags: ["aspects", "moon"],
  };
}

function tagged(
  summary: string,
  start: string,
  eventTags: string[],
): DetectedCalendarEvent {
  return { ...event(summary, start), tags: eventTags };
}

/** Thirty seconds: insert batches take over five seconds on CI. */
const BULK_UPSERT_TIMEOUT_MILLISECONDS = 30_000;

describe("calendar events service integration", () => {
  let database: DatabaseTestingModule;
  let service: CalendarEventsService;
  let repository: Repository<CalendarEvent>;
  let tags: Repository<Tag>;

  beforeAll(async () => {
    database = await startCaelundasDatabase([
      LoggerModule,
      CalendarEventsModule,
    ]);
    service = database.module.get(CalendarEventsService);
    repository = database.repository(CalendarEvent);
    tags = database.repository(Tag);
  }, DATABASE_TIMEOUT_MILLISECONDS);

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await database.close();
  });

  it("stores events with the location they were computed for", async () => {
    expect.hasAssertions();

    await service.upsert(
      [event("Stored", "2026-01-10T00:00:00Z")],
      philadelphia,
    );
    const [row] = await repository.findBy({ name: "Stored" });

    expect(row?.latitude).toBe("39.949309");
    expect(row?.longitude).toBe("-75.171690");
  });

  it("fills the generated local day and hour in the observer's zone on insert and upsert", async () => {
    expect.hasAssertions();

    const written = event(
      "Generated",
      "2026-01-10T03:30:00Z",
      "2026-01-10T05:00:00Z",
    );
    const read = async (): Promise<
      {
        end_local_day: string;
        start_local_day: string;
        start_local_hour: number;
      }[]
    > =>
      repository.manager.query(
        `select start_local_day::text, end_local_day::text, start_local_hour
         from calendar_events where name = 'Generated'`,
      );

    await service.upsert([written], philadelphia);
    await service.upsert(
      [{ ...written, description: "changed" }],
      philadelphia,
    );

    await expect(read()).resolves.toStrictEqual([
      {
        end_local_day: "2026-01-10",
        start_local_day: "2026-01-09",
        start_local_hour: 22,
      },
    ]);
  });

  it("refreshes the tag sets and the facts caelundas-web queries after every upsert", async () => {
    expect.hasAssertions();

    await service.upsert(
      [tagged("Read model", "2026-01-13T00:00:00Z", ["Planet", "Sun"])],
      philadelphia,
    );
    const [fact] = await repository.manager.query<
      { direct: string[]; tags: string[] }[]
    >(
      `select
        (select array_agg(t.name order by t.name) from tags t where t.id = any(f.tag_ids || f.ancestor_tag_ids)) as tags,
        (select array_agg(t.name order by t.name) from tags t where t.id = any(f.tag_ids)) as direct
      from calendar_event_tag_sets f
      inner join calendar_events e on e.id = f.calendar_event_id
      where e.name = 'Read model'`,
    );
    const rollups = await repository.manager.query<{ name: string }[]>(
      `select distinct t.name
        from calendar_event_facts r
        inner join filters f on f.id = r.filter_id
        inner join tags t on t.id = f.tag_id
        inner join calendar_events e on e.start_local_day = f.period
        where e.name = 'Read model'`,
    );

    expect(fact?.tags).toContain("Sun");
    expect(fact?.direct).toContain("Sun");
    expect(rollups.map(({ name }) => name)).toContain("Sun");
  });

  it(
    "refreshes the metrics view once per upsert, after the last batch is written",
    async () => {
      expect.hasAssertions();

      const databaseService = database.module.get(CaelundasDatabaseService);
      const rebuild = databaseService.refreshMetrics.bind(databaseService);
      const refresh = vi.spyOn(databaseService, "refreshMetrics");
      refresh.mockClear();
      const count = CALENDAR_EVENT_BATCH_SIZE + 1;
      const stored: number[] = [];
      refresh.mockImplementationOnce(async (manager) => {
        stored.push(
          await manager.getRepository(CalendarEvent).countBy({
            name: In(["Refresh first", `Refresh ${String(count - 1)}`]),
          }),
        );
        await rebuild(manager);
      });
      const start = moment.utc("2031-01-01T00:00:00Z");
      await service.upsert(
        Array.from({ length: count }, (_value, index) =>
          event(
            index === 0 ? "Refresh first" : `Refresh ${String(index)}`,
            start.clone().add(index, "minutes").toISOString(),
          ),
        ),
        philadelphia,
      );

      expect(refresh).toHaveBeenCalledTimes(1);
      expect(stored).toStrictEqual([2]);

      await repository.delete({ name: Like("Refresh %") });
      await repository.delete({ name: "Refresh first" });
    },
    BULK_UPSERT_TIMEOUT_MILLISECONDS,
  );

  it("refreshes the facts, so the day filter counts the new event", async () => {
    expect.hasAssertions();

    await service.upsert(
      [event("Metrics rollup", "2032-02-03T15:00:00Z", "2032-02-03T17:30:00Z")],
      philadelphia,
    );
    const day = await repository.manager.query<
      { measurement: number; slug: string }[]
    >(
      `select m.slug, r.measurement
      from calendar_event_facts r
      inner join measures m on m.id = r.measure_id
      inner join filters f on f.id = r.filter_id
      where f.period = '2032-02-03' and f.tag_id is null and m.slug in ('events', 'duration')
      order by m.slug`,
    );
    const [tagRollups] = await repository.manager.query<{ count: string }[]>(
      `select count(*) from filters where period = '2032-02-03' and tag_id is not null`,
    );

    expect(day).toStrictEqual([
      { measurement: 150, slug: "duration" },
      { measurement: 1, slug: "events" },
    ]);
    expect(Number(tagRollups?.count)).toBeGreaterThan(0);
  });

  it("stores no event when the metrics refresh fails", async () => {
    expect.hasAssertions();

    vi.spyOn(
      database.module.get(CaelundasDatabaseService),
      "refreshMetrics",
    ).mockRejectedValueOnce(new Error("refresh failed"));

    await expect(
      service.upsert(
        [tagged("Rolled back", "2026-01-20T00:00:00Z", ["rolled back tag"])],
        philadelphia,
      ),
    ).rejects.toThrow("refresh failed");
    await expect(repository.countBy({ name: "Rolled back" })).resolves.toBe(0);
    await expect(tags.countBy({ name: "rolled back tag" })).resolves.toBe(0);
  });

  it("stores an instant as a timestamptz and reads it back as a UTC moment", async () => {
    expect.hasAssertions();

    await service.upsert(
      [event("Instant text", "2026-01-12T06:30:15.250Z")],
      philadelphia,
    );
    const [raw] = await repository.manager.query<{ end: Date; start: Date }[]>(
      `select "start", "end" from calendar_events where name = 'Instant text'`,
    );
    const [row] = await repository.findBy({ name: "Instant text" });

    expect(raw?.start.toISOString()).toBe("2026-01-12T06:30:15.250Z");
    expect(raw?.end.toISOString()).toBe("2026-01-12T06:30:15.250Z");
    expect(row?.start.toISOString(true)).toBe("2026-01-12T06:30:15.250+00:00");
  });

  it("stores each event with its observer's timezone", async () => {
    expect.hasAssertions();

    const sunset = event("Zoned", "2026-01-11T00:00:00Z");
    await service.upsert([sunset], philadelphia);
    await service.upsert([sunset], sydney);
    const rows = await repository.find({
      order: { latitude: "ASC" },
      where: { name: "Zoned" },
    });

    expect(rows.map(({ timezone }) => timezone)).toStrictEqual([
      "Australia/Sydney",
      "America/New_York",
    ]);
  });

  it("updates a repeated event in place and advances updatedAt", async () => {
    expect.hasAssertions();

    await service.upsert(
      [event("Repeated", "2026-02-10T00:00:00Z")],
      philadelphia,
    );
    const [first] = await repository.findBy({ name: "Repeated" });
    await service.upsert(
      [
        {
          ...event("Repeated", "2026-02-10T00:00:00Z"),
          description: "changed",
        },
      ],
      philadelphia,
    );
    const rows = await repository.findBy({ name: "Repeated" });

    expect(rows).toHaveLength(1);
    expect(rows[0]?.note).toBe("changed");
    expect(rows[0]?.id).toBe(first?.id);
    expect(rows[0]?.createdAt.getTime()).toBe(first?.createdAt.getTime());
    expect(rows[0]?.updatedAt.getTime()).toBeGreaterThan(
      first?.updatedAt.getTime() ?? Number.POSITIVE_INFINITY,
    );
  });

  it("adds separate rows for a second location", async () => {
    expect.hasAssertions();

    const sunrise = event("Sunrise", "2026-03-10T10:00:00Z");
    await service.upsert([sunrise], philadelphia);
    await service.upsert([sunrise], sydney);

    await expect(repository.countBy({ name: "Sunrise" })).resolves.toBe(2);
  });

  it("keeps one row when a batch repeats an event", async () => {
    expect.hasAssertions();

    const twice = event("Twice", "2026-04-10T00:00:00Z");
    await service.upsert([twice, twice], philadelphia);

    await expect(repository.countBy({ name: "Twice" })).resolves.toBe(1);
  });

  it("stores a boundary and a span of the same title and start as two rows", async () => {
    expect.hasAssertions();

    const start = "2026-05-10T00:00:00Z";
    await service.upsert(
      [
        tagged("Shared title", start, ["boundary only"]),
        {
          ...tagged("Shared title", start, ["span only"]),
          end: moment.utc("2026-05-12T00:00:00Z"),
        },
      ],
      philadelphia,
    );
    const rows = await findStoredEvents(database.dataSource, {
      end: moment.utc("2026-05-11T00:00:00Z"),
      latitude: philadelphia.latitude,
      longitude: philadelphia.longitude,
      start: moment.utc("2026-05-09T00:00:00Z"),
    });
    const own = rows
      .filter(({ summary }) => summary === "Shared title")
      .map(({ tags }) =>
        tags.filter((tag) => tag === "boundary only" || tag === "span only"),
      );

    expect(own).toHaveLength(2);
    expect(own.toSorted()).toStrictEqual([["boundary only"], ["span only"]]);
  });

  it("stores a title with its stray whitespace tidied", async () => {
    expect.hasAssertions();

    await service.upsert(
      [event("  Spaced   out ", "2026-05-20T00:00:00Z")],
      philadelphia,
    );

    await expect(repository.countBy({ name: "Spaced out" })).resolves.toBe(1);
  });

  it(
    "writes more events than one statement's parameters allow",
    async () => {
      expect.hasAssertions();

      const count = CALENDAR_EVENT_BATCH_SIZE + 10;
      const start = moment.utc("2030-01-01T00:00:00Z");
      await service.upsert(
        Array.from({ length: count }, (_value, index) => {
          const at = start.clone().add(index, "minutes").toISOString();
          return event(`Bulk ${String(index)}`, at);
        }),
        philadelphia,
      );

      await expect(
        repository
          .createQueryBuilder("event")
          .where("event.name LIKE 'Bulk %'")
          .getCount(),
      ).resolves.toBe(count);

      // Later upserts refresh the metrics facts, whose cost grows with the rows.
      await repository.delete({ name: Like("Bulk %") });
    },
    BULK_UPSERT_TIMEOUT_MILLISECONDS,
  );

  describe("tags", () => {
    async function tag(name: string, parent?: Tag): Promise<Tag> {
      return tagRepository(database.dataSource).save({
        name,
        parent,
        slug: tagSlug(name),
      });
    }

    /** The names of the tags the tag trees hold above (or beneath) `node`, itself included, after refreshing it. */
    async function treeOf(
      node: Tag,
      direction: "ancestors" | "descendants",
    ): Promise<string[]> {
      await database.dataSource.query("refresh materialized view tag_trees");
      const [near, far] =
        direction === "ancestors"
          ? ["descendant_id", "ancestor_id"]
          : ["ancestor_id", "descendant_id"];
      const rows = await database.dataSource.query<{ name: string }[]>(
        `select t."name" from tag_trees c join tags t on t.id = c.${far} where c.${near} = $1 order by t."name"`,
        [node.id],
      );

      return rows.map(({ name }) => name);
    }

    /** The name of the root above the one node named `name`. */
    async function rootOf(name: string): Promise<string | undefined> {
      const [node] = await tags.findBy({ name });
      if (node === undefined) {
        return undefined;
      }
      const rows = await database.dataSource.query<{ name: string }[]>(
        `select t."name" from tag_trees c join tags t on t.id = c.ancestor_id
        where c.descendant_id = $1
          and not exists (select 1 from tag_edges e where e.target_node = t.id)`,
        [node.id],
      );
      return rows[0]?.name;
    }

    it("resolves ancestors and descendants through the tag trees", async () => {
      expect.hasAssertions();

      const type = await tag("Tree type");
      const aspect = await tag("Tree aspect", type);
      const major = await tag("Tree major", aspect);
      await tag("Tree minor", aspect);

      const ancestors = await treeOf(major, "ancestors");
      const descendants = await treeOf(aspect, "descendants");

      expect(ancestors).toStrictEqual([
        "Tree aspect",
        "Tree major",
        "Tree type",
      ]);
      expect(descendants).toStrictEqual([
        "Tree aspect",
        "Tree major",
        "Tree minor",
      ]);
    });

    it("stores each raw tag as a root of its own", async () => {
      expect.hasAssertions();

      await service.upsert(
        [tagged("Rooted", "2026-05-10T00:00:00Z", ["rooted a", "rooted b"])],
        philadelphia,
      );
      const roots = await tags.find({
        order: { name: "ASC" },
        where: { name: In(["rooted a", "rooted b"]) },
      });
      const edges = await database.dataSource
        .getRepository("TagEdge")
        .countBy({ targetNode: In(roots.map(({ id }) => id)) });

      expect(roots.map(({ name }) => name)).toStrictEqual([
        "rooted a",
        "rooted b",
      ]);
      expect(edges).toBe(0);
    });

    it("replaces an event's tags when a re-run changes them", async () => {
      expect.hasAssertions();

      const start = "2026-06-10T00:00:00Z";
      await service.upsert(
        [tagged("Changed tags", start, ["dropped", "kept"])],
        philadelphia,
      );
      await service.upsert(
        [tagged("Changed tags", start, ["kept", "added"])],
        philadelphia,
      );
      const rows = await findStoredEvents(database.dataSource, {
        end: moment.utc("2026-06-11T00:00:00Z"),
        latitude: philadelphia.latitude,
        longitude: philadelphia.longitude,
        start: moment.utc(start),
      });

      expect(rows.map(({ summary, tags }) => [summary, tags])).toStrictEqual([
        ["Changed tags", ["Perfective", "added", "kept"]],
      ]);
    });

    it("links each event of a batch mixing stored and new ones to its own tags", async () => {
      expect.hasAssertions();

      const start = "2026-08-10T00:00:00Z";
      await service.upsert(
        [tagged("Mixed stored", start, ["mixed old"])],
        philadelphia,
      );
      await service.upsert(
        [
          tagged("Mixed new", start, ["mixed fresh"]),
          tagged("Mixed stored", start, ["mixed updated"]),
        ],
        philadelphia,
      );
      const rows = await findStoredEvents(database.dataSource, {
        end: moment.utc("2026-08-11T00:00:00Z"),
        latitude: philadelphia.latitude,
        longitude: philadelphia.longitude,
        start: moment.utc(start),
      });

      expect(rows.map(({ summary, tags }) => [summary, tags])).toStrictEqual([
        ["Mixed new", ["Perfective", "mixed fresh"]],
        ["Mixed stored", ["Perfective", "mixed updated"]],
      ]);
    });

    it("saves each node of a nested path once, under its ancestors", async () => {
      expect.hasAssertions();

      const nestedTags = ["Simple Aspect", "Major Aspect", "Trine"];

      await service.upsert(
        [tagged("Nested one", "2026-07-10T00:00:00Z", nestedTags)],
        philadelphia,
      );
      await service.upsert(
        [tagged("Nested two", "2026-07-11T00:00:00Z", nestedTags)],
        philadelphia,
      );
      const leaves = await tags.findBy({ name: "Trine" });
      const [leaf] = leaves;
      const ancestors =
        leaf === undefined ? [] : await treeOf(leaf, "ancestors");

      expect(leaves).toHaveLength(1);
      expect(ancestors).toStrictEqual(["Aspect", "Major", "Simple", "Trine"]);
    });

    it("tags an Aries event with its sign, element, modality and polarity side by side", async () => {
      expect.hasAssertions();

      const start = "2026-09-10T00:00:00Z";
      await service.upsert(
        [
          tagged("Aries ingress", start, [
            "Astronomy",
            "Astrology",
            "Ingress",
            "Mars",
            "Aries",
          ]),
        ],
        philadelphia,
      );
      const [row] = await findStoredEvents(database.dataSource, {
        end: moment.utc("2026-09-11T00:00:00Z"),
        latitude: philadelphia.latitude,
        longitude: philadelphia.longitude,
        start: moment.utc(start),
      });
      const roots = await Promise.all(
        ["Aries", "Fire", "Cardinal", "Positive"].map(async (name) =>
          rootOf(name),
        ),
      );

      expect(row?.tags).toStrictEqual(
        expect.arrayContaining(["Aries", "Cardinal", "Fire", "Positive"]),
      );
      expect(roots).toStrictEqual(["Zodiac", "Zodiac", "Zodiac", "Zodiac"]);
    });

    it("files a planetary phase under Phase as Planetary, with its planet", async () => {
      expect.hasAssertions();

      const start = "2026-09-12T00:00:00Z";
      await service.upsert(
        [
          tagged("Mars opposition", start, [
            "Astronomy",
            "Astrology",
            "Planetary Phase",
            "Martian",
            "Opposition",
          ]),
        ],
        philadelphia,
      );
      const [row] = await findStoredEvents(database.dataSource, {
        end: moment.utc("2026-09-13T00:00:00Z"),
        latitude: philadelphia.latitude,
        longitude: philadelphia.longitude,
        start: moment.utc(start),
      });
      const [opposition] = await tags.findBy({ name: "Martian Opposition" });
      const ancestors =
        opposition === undefined ? [] : await treeOf(opposition, "ancestors");

      expect(row?.tags).toStrictEqual(
        expect.arrayContaining(["Mars", "Martian Opposition", "Opposition"]),
      );
      expect(ancestors).toStrictEqual([
        "Martian",
        "Martian Opposition",
        "Phase",
        "Planetary",
      ]);
    });

    it("puts Venus under Planet and Benefic as one node, however many events carry it", async () => {
      expect.hasAssertions();

      const start = "2026-10-10T00:00:00Z";
      await service.upsert(
        [
          tagged("Venus one", start, ["Astronomy", "Astrology", "Venus"]),
          tagged("Venus two", "2026-10-11T00:00:00Z", [
            "Astronomy",
            "Astrology",
            "Venus",
          ]),
        ],
        philadelphia,
      );
      const venus = await tags.findBy({ name: "Venus" });
      const [node] = venus;
      const parents = await database.dataSource.query<{ name: string }[]>(
        `select p."name" from tag_edges e join tags p on p.id = e.source_node
        where e.target_node = $1 order by p."name"`,
        [node?.id],
      );
      const ancestors =
        node === undefined ? [] : await treeOf(node, "ancestors");

      expect(venus).toHaveLength(1);
      expect(parents.map(({ name }) => name)).toStrictEqual([
        "Benefic",
        "Personal",
      ]);
      expect(ancestors).toStrictEqual([
        "Benefic",
        "Body",
        "Personal",
        "Planet",
        "Venus",
      ]);
    });

    it("gives a node that already exists its other parent when an event carries it again", async () => {
      expect.hasAssertions();

      const [saturn] = await tags.findBy({ name: "Saturn" });
      const edges = database.dataSource.getRepository("TagEdge");

      expect(saturn).toBeUndefined();

      await service.upsert(
        [tagged("Saturn one", "2026-10-12T00:00:00Z", ["Saturn"])],
        philadelphia,
      );
      const [created] = await tags.findBy({ name: "Saturn" });
      await edges.delete({ targetNode: created?.id });
      const social = await tags.findOneByOrFail({ name: "Social" });
      await edges.insert({ sourceNode: social.id, targetNode: created?.id });
      await service.upsert(
        [tagged("Saturn two", "2026-10-13T00:00:00Z", ["Saturn"])],
        philadelphia,
      );
      const parents = await database.dataSource.query<{ name: string }[]>(
        `select p."name" from tag_edges e join tags p on p.id = e.source_node
        where e.target_node = $1 order by p."name"`,
        [created?.id],
      );

      expect(parents.map(({ name }) => name)).toStrictEqual([
        "Malefic",
        "Social",
      ]);
    });

    it("reuses one node for a tag many events carry", async () => {
      expect.hasAssertions();

      await service.upsert(
        [
          tagged("Shared one", "2026-05-11T00:00:00Z", ["shared"]),
          tagged("Shared two", "2026-05-12T00:00:00Z", ["shared"]),
        ],
        philadelphia,
      );
      await service.upsert(
        [tagged("Shared three", "2026-05-13T00:00:00Z", ["shared"])],
        sydney,
      );

      await expect(tags.countBy({ name: "shared" })).resolves.toBe(1);
    });

    it("keeps a name unique among its siblings, roots included", async () => {
      expect.hasAssertions();

      const planet = await tag("Unique planet");
      const sign = await tag("Unique sign");
      await tag("Mars", planet);
      await tag("Mars", sign);

      await expect(tag("Mars", planet)).rejects.toThrow(/same name or slug/u);
      await expect(tag("Unique planet")).rejects.toThrow(/another root/u);
    });

    it("stores each written tag with its slug", async () => {
      expect.hasAssertions();

      await service.upsert(
        [tagged("Slugged", "2026-05-14T00:00:00Z", ["Slug Me Please"])],
        philadelphia,
      );

      await expect(
        tags.findOneByOrFail({ name: "Slug Me Please" }),
      ).resolves.toMatchObject({ slug: "slug-me-please" });
    });

    it("stores each tag's menu flags and restores them when a rerun finds them changed", async () => {
      expect.hasAssertions();

      await service.upsert(
        [tagged("Flagged one", "2026-05-15T00:00:00Z", ["Aries"])],
        philadelphia,
      );

      const sign = await tags.findOneByOrFail({ name: "Element" });
      const aries = await tags.findOneByOrFail({ name: "Aries" });

      expect(sign).toMatchObject({
        isFilterable: false,
        isGroupable: true,
        isSelectable: true,
        isSortable: true,
      });
      expect(aries).toMatchObject({ isFilterable: true, isGroupable: true });

      await tags.update(sign.id, { isFilterable: true, isSortable: false });
      await service.upsert(
        [tagged("Flagged two", "2026-05-16T00:00:00Z", ["Aries"])],
        philadelphia,
      );

      await expect(
        tags.findOneByOrFail({ name: "Element" }),
      ).resolves.toMatchObject({ isFilterable: false, isSortable: true });
    });

    it("refuses two siblings whose names slug alike", async () => {
      expect.hasAssertions();

      await expect(
        service.upsert(
          [tagged("Clash", "2026-05-15T00:00:00Z", ["Clash Tag", "clash-tag"])],
          philadelphia,
        ),
      ).rejects.toThrow('share the slug "clash-tag"');
      await expect(tags.countBy({ slug: "clash-tag" })).resolves.toBe(0);
    });

    it("refuses two children of one parent whose names slug alike", async () => {
      expect.hasAssertions();

      const resolver = database.module.get(TagsService, { strict: false });

      await expect(
        database.dataSource.transaction(async (manager) =>
          resolver.resolve(manager, [
            ["Slug Group", "Group Clash"],
            ["Slug Group", "group-clash"],
          ]),
        ),
      ).rejects.toThrow('share the slug "group-clash" under');
    });

    it("refuses to give a node a parent that already has a different child of its name", async () => {
      expect.hasAssertions();

      const resolver = database.module.get(TagsService, { strict: false });
      const now = moment.utc("2026-10-10T00:00:00Z");
      const venusPaths = classifyEvent({
        end: now,
        start: now,
        tags: ["Astronomy", "Astrology", "Venus"],
      }).filter((path) => path.at(-1) === "Venus");
      const resolve = async (): Promise<Map<string, string>> =>
        database.dataSource.transaction(async (manager) =>
          resolver.resolve(manager, venusPaths),
        );

      await resolve();
      const edges = database.dataSource.getRepository<{
        sourceNode: string;
        targetNode: string;
      }>("TagEdge");
      const venus = await tags.findOneByOrFail({ name: "Venus" });
      const benefic = await tags.findOneByOrFail({ name: "Benefic" });
      await edges.delete({ sourceNode: benefic.id, targetNode: venus.id });
      const saved = await tags.save(
        tags.create({ name: "Venus", slug: "venus" }),
      );
      await edges.insert({ sourceNode: benefic.id, targetNode: saved.id });

      await expect(resolve()).rejects.toThrow(
        'The tag "Venus" is already a different child of',
      );
    });
  });
});
