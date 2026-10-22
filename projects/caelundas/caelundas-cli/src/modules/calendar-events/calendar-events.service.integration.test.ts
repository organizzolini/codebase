import moment from "moment-timezone";
import { In } from "typeorm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { LoggerModule } from "@codebase/observability";
import { startDatabaseTestingModule } from "@codebase/persistence/testing";

import { environmentSchema } from "../../caelundas-cli.constants";
import { DATABASE_ENTITIES } from "../database/database.constants";
import { DatabaseModule } from "../database/database.module";
import { CalendarEvent } from "../database/entities/calendar-event.entity";
import { Tag } from "../database/entities/tag.entity";
import { Migration1792416080531 } from "../database/migrations/1792416080531-migration";

import { CALENDAR_EVENT_BATCH_SIZE } from "./calendar-events.constants";
import { CalendarEventsModule } from "./calendar-events.module";
import { CalendarEventsService } from "./calendar-events.service";

import type { DetectedCalendarEvent } from "../database/database.types";
import type { DatabaseTestingModule } from "@codebase/persistence/testing";
import type { Repository, TreeRepository } from "typeorm";

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

/**
 * Two minutes rather than the shared ten seconds, as the end-to-end suite
 * allows: starting a container and running the migration took over ten
 * seconds during a full coverage run, with every suite competing for it.
 */
const CONTAINER_START_TIMEOUT_MILLISECONDS = 120_000;

describe("calendar events service integration", () => {
  let database: DatabaseTestingModule;
  let service: CalendarEventsService;
  let repository: Repository<CalendarEvent>;
  let tags: TreeRepository<Tag>;

  beforeAll(async () => {
    // The root's unprefixed variables must never reach the connection.
    vi.stubEnv("POSTGRES_DB", "postgres");
    database = await startDatabaseTestingModule({
      database: DatabaseModule,
      entities: DATABASE_ENTITIES,
      imports: [LoggerModule, CalendarEventsModule],
      migrations: [Migration1792416080531],
      project: "caelundas",
      validate: (config) => environmentSchema.parse(config),
    });
    service = database.module.get(CalendarEventsService);
    repository = database.repository(CalendarEvent);
    tags = database.dataSource.getTreeRepository(Tag);
  }, CONTAINER_START_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await database.close();
    vi.unstubAllEnvs();
  });

  it("stores events with the location they were computed for", async () => {
    expect.hasAssertions();

    await service.upsert(
      [event("Stored", "2026-01-10T00:00:00Z")],
      philadelphia,
    );
    const [row] = await repository.findBy({ summary: "Stored" });

    expect(row?.latitude).toBe("39.949309");
    expect(row?.longitude).toBe("-75.171690");
  });

  it("stores each event with its observer's timezone", async () => {
    expect.hasAssertions();

    const sunset = event("Zoned", "2026-01-11T00:00:00Z");
    await service.upsert([sunset], philadelphia);
    await service.upsert([sunset], sydney);
    const rows = await repository.find({
      order: { latitude: "ASC" },
      where: { summary: "Zoned" },
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
    const [first] = await repository.findBy({ summary: "Repeated" });
    await service.upsert(
      [
        {
          ...event("Repeated", "2026-02-10T00:00:00Z"),
          description: "changed",
        },
      ],
      philadelphia,
    );
    const rows = await repository.findBy({ summary: "Repeated" });

    expect(rows).toHaveLength(1);
    expect(rows[0]?.description).toBe("changed");
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

    await expect(repository.countBy({ summary: "Sunrise" })).resolves.toBe(2);
  });

  it("keeps one row when a batch repeats an event", async () => {
    expect.hasAssertions();

    const twice = event("Twice", "2026-04-10T00:00:00Z");
    await service.upsert([twice, twice], philadelphia);

    await expect(repository.countBy({ summary: "Twice" })).resolves.toBe(1);
  });

  /**
   * Thirty seconds rather than the shared five: two full batches of inserts
   * took just over five seconds on a CI runner, which is several times
   * slower than a local machine.
   */
  const BULK_UPSERT_TIMEOUT_MILLISECONDS = 30_000;

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
          .where("event.summary LIKE 'Bulk %'")
          .getCount(),
      ).resolves.toBe(count);
    },
    BULK_UPSERT_TIMEOUT_MILLISECONDS,
  );

  describe("findInRange", () => {
    const range = {
      end: moment.utc("2027-01-31T00:00:00Z"),
      latitude: philadelphia.latitude,
      longitude: philadelphia.longitude,
      start: moment.utc("2027-01-01T00:00:00Z"),
    };

    beforeAll(async () => {
      await service.upsert(
        [
          tagged("Inside", "2027-01-10T00:00:00Z", ["moon", "inside"]),
          event("Instant at start", "2027-01-01T00:00:00Z"),
          event("Before", "2026-12-01T00:00:00Z", "2026-12-02T00:00:00Z"),
          event("After", "2027-02-10T00:00:00Z"),
          event("Spans start", "2026-12-20T00:00:00Z", "2027-01-05T00:00:00Z"),
          event("Spans end", "2027-01-25T00:00:00Z", "2027-02-05T00:00:00Z"),
          event(
            "Ends at start",
            "2026-12-30T00:00:00Z",
            "2027-01-01T00:00:00Z",
          ),
        ],
        philadelphia,
      );
      await service.upsert(
        [event("Elsewhere", "2027-01-10T00:00:00Z")],
        sydney,
      );
    });

    it("includes events that overlap the range, ordered by start", async () => {
      expect.hasAssertions();

      const rows = await service.findInRange(range);

      expect(rows.map((row) => row.summary)).toStrictEqual([
        "Spans start",
        "Instant at start",
        "Inside",
        "Spans end",
      ]);
    });

    it("returns each event with its tags, ordered by name", async () => {
      expect.hasAssertions();

      const rows = await service.findInRange(range);

      expect(rows.map(({ summary, tags }) => [summary, tags])).toStrictEqual([
        ["Spans start", ["Duration", "aspects", "moon"]],
        ["Instant at start", ["Instant", "aspects", "moon"]],
        ["Inside", ["Instant", "inside", "moon"]],
        ["Spans end", ["Duration", "aspects", "moon"]],
      ]);
    });

    it("returns only the requested location", async () => {
      expect.hasAssertions();

      const rows = await service.findInRange({
        ...range,
        latitude: sydney.latitude,
        longitude: sydney.longitude,
      });

      expect(rows.map((row) => row.summary)).toStrictEqual(["Elsewhere"]);
    });
  });

  describe("tags", () => {
    async function tag(name: string, parent: null | Tag = null): Promise<Tag> {
      return tags.save(tags.create({ name, parent }));
    }

    /** The name of the root above the one node named `name`. */
    async function rootOf(name: string): Promise<string | undefined> {
      const [node] = await tags.findBy({ name });
      if (node === undefined) {
        return undefined;
      }
      const ancestors = await tags.findAncestors(node);
      return ancestors.find(({ parentId }) => parentId === null)?.name;
    }

    it("resolves ancestors and descendants through the closure table", async () => {
      expect.hasAssertions();

      const type = await tag("Tree type");
      const aspect = await tag("Tree aspect", type);
      const major = await tag("Tree major", aspect);
      await tag("Tree minor", aspect);

      const ancestors = await tags.findAncestors(major);
      const descendants = await tags.findDescendants(aspect);

      expect(ancestors.map(({ name }) => name).toSorted()).toStrictEqual([
        "Tree aspect",
        "Tree major",
        "Tree type",
      ]);
      expect(descendants.map(({ name }) => name).toSorted()).toStrictEqual([
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

      expect(roots.map(({ name, parentId }) => [name, parentId])).toStrictEqual(
        [
          ["rooted a", null],
          ["rooted b", null],
        ],
      );
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
      const rows = await service.findInRange({
        end: moment.utc("2026-06-11T00:00:00Z"),
        latitude: philadelphia.latitude,
        longitude: philadelphia.longitude,
        start: moment.utc(start),
      });

      expect(rows.map(({ summary, tags }) => [summary, tags])).toStrictEqual([
        ["Changed tags", ["Instant", "added", "kept"]],
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
      const rows = await service.findInRange({
        end: moment.utc("2026-08-11T00:00:00Z"),
        latitude: philadelphia.latitude,
        longitude: philadelphia.longitude,
        start: moment.utc(start),
      });

      expect(rows.map(({ summary, tags }) => [summary, tags])).toStrictEqual([
        ["Mixed new", ["Instant", "mixed fresh"]],
        ["Mixed stored", ["Instant", "mixed updated"]],
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
        leaf === undefined ? [] : await tags.findAncestors(leaf);

      expect(leaves).toHaveLength(1);
      expect(ancestors.map(({ name }) => name).toSorted()).toStrictEqual([
        "Aspect",
        "Major Aspect",
        "Simple Aspect",
        "Trine",
        "Type",
      ]);
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
      const [row] = await service.findInRange({
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
      expect(roots).toStrictEqual(["Sign", "Element", "Modality", "Polarity"]);
    });

    it("files a planetary phase under Type as Planetary Phase, with its planet", async () => {
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
      const [row] = await service.findInRange({
        end: moment.utc("2026-09-13T00:00:00Z"),
        latitude: philadelphia.latitude,
        longitude: philadelphia.longitude,
        start: moment.utc(start),
      });
      const [opposition] = await tags.findBy({ name: "Martian Opposition" });
      const ancestors =
        opposition === undefined ? [] : await tags.findAncestors(opposition);

      expect(row?.tags).toStrictEqual(
        expect.arrayContaining(["Mars", "Martian Opposition", "Opposition"]),
      );
      expect(ancestors.map(({ name }) => name).toSorted()).toStrictEqual([
        "Martian",
        "Martian Opposition",
        "Planetary Phase",
        "Type",
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

      await expect(tag("Mars", planet)).rejects.toThrow(/tags_sibling_name/u);
      await expect(tag("Unique planet")).rejects.toThrow(/tags_root_name/u);
    });
  });
});
