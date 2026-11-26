import { createMock } from "@golevelup/ts-vitest";
import _ from "lodash";
import moment from "moment-timezone";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { CalendarEvent } from "@codebase/caelundas-db";
import { LoggerService } from "@codebase/observability";

import { createMajorAspectsService } from "../testing/aspects/major-aspects.utilities";
import {
  detectable,
  runCalendarCommand,
} from "../testing/support/calendar-command.utilities";
import {
  DATABASE_TIMEOUT_MILLISECONDS,
  startCaelundasDatabase,
} from "../testing/support/database";

import { environmentSchema } from "./caelundas-cli.constants";
import { MathService } from "./modules/ephemeris/modules/math/math.service";
import { inputSchema } from "./modules/input/input.constants";
import { IngressesService } from "./modules/perfective/modules/ingresses/ingresses.service";
import { ProgressiveUtilitiesService } from "./modules/progressive/progressive-utilities.service";

import type { EphemerisService } from "./modules/ephemeris/ephemeris.service";
import type { DatabaseTestingModule } from "@codebase/persistence/testing";
import type { Repository } from "typeorm";

describe("main end-to-end suite", () => {
  it("defaults the connection to the local caelundas database", () => {
    expect.hasAssertions();
    expect(environmentSchema.parse({})).toStrictEqual({
      CAELUNDAS_POSTGRES_DATABASE: "caelundas_development",
      CAELUNDAS_POSTGRES_HOST: "localhost",
      CAELUNDAS_POSTGRES_PASSWORD: "caelundas_password",
      CAELUNDAS_POSTGRES_PORT: 5432,
      CAELUNDAS_POSTGRES_SCHEMA: "caelundas",
      CAELUNDAS_POSTGRES_USERNAME: "caelundas_username",
    });
  });

  it("reads only CAELUNDAS_POSTGRES_*, ignoring the root's admin login", () => {
    expect.hasAssertions();

    const environment = environmentSchema.parse({
      POSTGRES_DB: "postgres",
      POSTGRES_PASSWORD: "postgres",
      POSTGRES_USER: "postgres",
    });

    expect(environment).not.toHaveProperty("POSTGRES_DB");
    expect(environment).toMatchObject({
      CAELUNDAS_POSTGRES_USERNAME: "caelundas_username",
    });
  });

  describe("calendar generation e2e", { timeout: 10_000 }, () => {
    describe("input validation e2e", () => {
      it("validates and transform coordinates correctly", () => {
        const result = inputSchema.parse({
          endDate: "2025-03-31",
          latitude: "40.7128",
          longitude: "-74.006",
          startDate: "2025-03-01",
        });

        expect(result.latitude).toBe(40.7128);
        expect(result.longitude).toBe(-74.006);
        expect(result.timezone).toBe("America/New_York");
        expect(moment.isMoment(result.start)).toBe(true);
        expect(moment.isMoment(result.end)).toBe(true);
      });

      it("infers correct timezone for different locations", () => {
        // Tokyo
        const tokyoResult = inputSchema.parse({
          endDate: "2025-01-02",
          latitude: "35.6762",
          longitude: "139.6503",
          startDate: "2025-01-01",
        });

        expect(tokyoResult.timezone).toBe("Asia/Tokyo");

        // London
        const londonResult = inputSchema.parse({
          endDate: "2025-01-02",
          latitude: "51.5074",
          longitude: "-0.1278",
          startDate: "2025-01-01",
        });

        expect(londonResult.timezone).toBe("Europe/London");

        // Sydney
        const sydneyResult = inputSchema.parse({
          endDate: "2025-01-02",
          latitude: "-33.8688",
          longitude: "151.2093",
          startDate: "2025-01-01",
        });

        expect(sydneyResult.timezone).toBe("Australia/Sydney");
      });
    });

    describe("event detection e2e", () => {
      it("correctly identify zodiac signs from longitude", () => {
        // Test all 12 signs at their starting degrees
        expect(IngressesService.getSign(0)).toBe("aries");
        expect(IngressesService.getSign(30)).toBe("taurus");
        expect(IngressesService.getSign(60)).toBe("gemini");
        expect(IngressesService.getSign(90)).toBe("cancer");
        expect(IngressesService.getSign(120)).toBe("leo");
        expect(IngressesService.getSign(150)).toBe("virgo");
        expect(IngressesService.getSign(180)).toBe("libra");
        expect(IngressesService.getSign(210)).toBe("scorpio");
        expect(IngressesService.getSign(240)).toBe("sagittarius");
        expect(IngressesService.getSign(270)).toBe("capricorn");
        expect(IngressesService.getSign(300)).toBe("aquarius");
        expect(IngressesService.getSign(330)).toBe("pisces");
      });

      it("correctly identify aspects from angular separation", () => {
        const service =
          createMajorAspectsService(createMock<EphemerisService>());

        // Test exact aspects
        expect(
          service.getMajorAspect({ longitudeBody1: 0, longitudeBody2: 0 }),
        ).toBe("conjunct");
        expect(
          service.getMajorAspect({ longitudeBody1: 0, longitudeBody2: 60 }),
        ).toBe("sextile");
        expect(
          service.getMajorAspect({ longitudeBody1: 0, longitudeBody2: 90 }),
        ).toBe("square");
        expect(
          service.getMajorAspect({ longitudeBody1: 0, longitudeBody2: 120 }),
        ).toBe("trine");
        expect(
          service.getMajorAspect({ longitudeBody1: 0, longitudeBody2: 180 }),
        ).toBe("opposite");

        // Test aspects with orb
        expect(
          service.getMajorAspect({ longitudeBody1: 0, longitudeBody2: 5 }),
        ).toBe("conjunct"); // 5° orb
        expect(
          service.getMajorAspect({ longitudeBody1: 0, longitudeBody2: 175 }),
        ).toBe("opposite"); // 5° orb
      });

      it("calculates progressive event pairs correctly", () => {
        const beginnings = [
          detectable("Forming 1", "2025-03-01T10:00:00Z"),
          detectable("Forming 2", "2025-03-05T10:00:00Z"),
        ];
        const endings = [
          detectable("Dissolving 1", "2025-03-03T10:00:00Z"),
          detectable("Dissolving 2", "2025-03-07T10:00:00Z"),
        ];

        const pairs = new ProgressiveUtilitiesService(
          new LoggerService(),
        ).pairProgressiveEvents(beginnings, endings, "test");

        expect(pairs).toHaveLength(2);
        expect(pairs[0]?.[0]?.start.toISOString()).toBe(
          "2025-03-01T10:00:00.000Z",
        );
        expect(pairs[0]?.[1]?.start.toISOString()).toBe(
          "2025-03-03T10:00:00.000Z",
        );
        expect(pairs[1]?.[0]?.start.toISOString()).toBe(
          "2025-03-05T10:00:00.000Z",
        );
        expect(pairs[1]?.[1]?.start.toISOString()).toBe(
          "2025-03-07T10:00:00.000Z",
        );
      });
    });

    describe("math utilities e2e", () => {
      it("normalizes degrees correctly across edge cases", () => {
        const mathService = new MathService();
        const normalizeDegrees = (d: number): number =>
          mathService.normalizeDegrees(d);
        const getAngle = (a: number, b: number): number =>
          mathService.getAngle(a, b);

        // Edge case: wrapping at 360
        expect(normalizeDegrees(360)).toBe(0);
        expect(normalizeDegrees(720)).toBe(0);

        // Edge case: negative degrees
        expect(normalizeDegrees(-1)).toBe(359);
        expect(normalizeDegrees(-360)).toBe(0);

        // Angle calculation across 0/360 boundary
        expect(getAngle(350, 10)).toBe(20); // Shortest path is 20°
        expect(getAngle(10, 350)).toBe(20);
      });

      it("generates correct combinations", () => {
        const mathService = new MathService();
        const getCombinations = <T>(array: T[], k: number): T[][] =>
          mathService.getCombinations(array, k);

        const planets = ["sun", "moon", "mercury", "venus", "mars"];

        // Get all pairs
        const pairs = getCombinations(planets, 2);

        expect(pairs).toHaveLength(10); // C(5,2) = 10

        // Get all triplets
        const triplets = getCombinations(planets, 3);

        expect(triplets).toHaveLength(10); // C(5,3) = 10

        // Verify no duplicates in pairs
        const pairStrings = pairs.map((p) => _.sortBy(p).join("-"));
        const uniquePairs = new Set(pairStrings);

        expect(uniquePairs.size).toBe(10);
      });
    });
  });

  describe("stored calendar events", { timeout: 120_000 }, () => {
    const philadelphia = { latitude: 39.949_309, longitude: -75.171_69 };
    const sydney = { latitude: -33.8688, longitude: 151.2093 };
    const marchFirstHalf = { endDate: "2026-03-16", startDate: "2026-03-01" };
    const marchSecondHalf = { endDate: "2026-03-31", startDate: "2026-03-10" };
    const sky = [
      detectable("Early", "2026-03-02T12:00:00Z"),
      detectable("Overlap", "2026-03-12T12:00:00Z"),
      detectable("Late", "2026-03-20T12:00:00Z"),
    ];
    let database: DatabaseTestingModule;
    let calendarEvents: Repository<CalendarEvent>;

    const run = async (
      place: { latitude: number; longitude: number },
      range: { endDate: string; startDate: string },
      detected = sky,
    ): Promise<void> => runCalendarCommand({ ...place, ...range }, detected);
    const summariesAt = async (place: {
      latitude: number;
      longitude: number;
    }): Promise<string[]> =>
      summaries(
        await calendarEvents.findBy({
          latitude: place.latitude.toFixed(6),
          longitude: place.longitude.toFixed(6),
        }),
      );
    const summaries = (rows: CalendarEvent[]): string[] =>
      rows.map((row) => row.summary).toSorted();

    beforeAll(async () => {
      database = await startCaelundasDatabase();
      calendarEvents = database.repository(CalendarEvent);
    }, DATABASE_TIMEOUT_MILLISECONDS);

    afterAll(async () => {
      await database.close();
    });

    it("writes event rows alongside one stored directly", async () => {
      expect.hasAssertions();

      // A row no detector reports is left untouched by a run.
      await calendarEvents.insert({
        description: "stored directly",
        end: moment.utc("2026-03-05T00:00:00Z"),
        latitude: "39.949309",
        longitude: "-75.171690",
        start: moment.utc("2026-03-05T00:00:00Z"),
        summary: "Planted",
        timezone: "America/New_York",
      });
      await run(philadelphia, marchFirstHalf);

      expect(summaries(await calendarEvents.find())).toStrictEqual([
        "Early",
        "Overlap",
        "Planted",
      ]);
      await expect(
        calendarEvents.countBy({ summary: "Planted" }),
      ).resolves.toBe(1);
    });

    it("is idempotent when a range repeats", async () => {
      expect.hasAssertions();

      const before = await calendarEvents.find({ order: { summary: "ASC" } });
      const links = await database.dataSource.query<{ count: string }[]>(
        "select count(*) as count from calendar_event_tags",
      );
      await run(philadelphia, marchFirstHalf);
      const after = await calendarEvents.find({ order: { summary: "ASC" } });

      expect(after.map((row) => row.id)).toStrictEqual(
        before.map((row) => row.id),
      );
      await expect(
        database.dataSource.query(
          "select count(*) as count from calendar_event_tags",
        ),
      ).resolves.toStrictEqual(links);
    });

    it("never stores two rows for one natural key", async () => {
      expect.hasAssertions();

      await expect(
        database.dataSource.query(
          `select summary, count(*) as count
            from calendar_events
            group by summary, "start", "end", latitude, longitude
            having count(*) > 1`,
        ),
      ).resolves.toStrictEqual([]);
    });

    it("stores database-assigned uuidv7 ids, six-decimal coordinates and instants", async () => {
      expect.hasAssertions();

      const [early] = await calendarEvents.findBy({
        latitude: "39.949309",
        summary: "Early",
      });

      expect(early?.id).toMatch(
        /^[\da-f]{8}-[\da-f]{4}-7[\da-f]{3}-[\da-f]{4}-[\da-f]{12}$/u,
      );
      expect(early?.latitude).toBe("39.949309");
      expect(early?.longitude).toBe("-75.171690");
      expect(early?.start.toISOString()).toBe("2026-03-02T12:00:00.000Z");
    });

    it("updates an overlapping range in place and adds only new events", async () => {
      expect.hasAssertions();

      const [before] = await calendarEvents.findBy({ summary: "Overlap" });
      await run(philadelphia, marchSecondHalf);
      const overlap = await calendarEvents.findBy({ summary: "Overlap" });

      expect(overlap).toHaveLength(1);
      expect(overlap[0]?.id).toBe(before?.id);
      expect(overlap[0]?.createdAt).toStrictEqual(before?.createdAt);
      expect(overlap[0]?.updatedAt.getTime()).toBeGreaterThan(
        before?.updatedAt.getTime() ?? Number.POSITIVE_INFINITY,
      );
      await expect(calendarEvents.countBy({ summary: "Late" })).resolves.toBe(
        1,
      );
      await expect(summariesAt(philadelphia)).resolves.toStrictEqual([
        "Early",
        "Late",
        "Overlap",
        "Planted",
      ]);
    });

    it("adds separate rows for a second location", async () => {
      expect.hasAssertions();

      const total = await calendarEvents.count();
      await run(sydney, marchFirstHalf);

      await expect(calendarEvents.count()).resolves.toBe(total + 2);
      await expect(summariesAt(sydney)).resolves.toStrictEqual([
        "Early",
        "Overlap",
      ]);
    });

    it("keeps an event spanning the edge of the range, once", async () => {
      expect.hasAssertions();

      const retrograde = detectable(
        "Retrograde",
        "2026-04-20T00:00:00Z",
        "2026-05-10T00:00:00Z",
      );
      await run(
        philadelphia,
        { endDate: "2026-05-01", startDate: "2026-04-01" },
        [retrograde],
      );
      const [stored] = await calendarEvents.findBy({ summary: "Retrograde" });
      // May's detector reports nothing, because the event started in April.
      await run(
        philadelphia,
        { endDate: "2026-06-01", startDate: "2026-05-01" },
        [],
      );
      const kept = await calendarEvents.findBy({ summary: "Retrograde" });

      expect(kept).toHaveLength(1);
      expect(kept[0]?.id).toBe(stored?.id);
      expect(kept[0]?.end.toISOString()).toBe("2026-05-10T00:00:00.000Z");
    });

    it("leaves the read model current after a run", async () => {
      expect.hasAssertions();

      await run(
        philadelphia,
        { endDate: "2026-07-10", startDate: "2026-07-01" },
        [detectable("Fresh", "2026-07-05T12:00:00Z")],
      );
      const { dataSource } = database;
      const [counts] = await dataSource.query<
        { derived: string; events: string; nodes: string; tags: string }[]
      >(
        `select
          (select count(*) from calendar_event_derived_times) as derived,
          (select count(*) from calendar_events) as events,
          (select count(*) from tag_nodes) as nodes,
          (select count(*) from tags) as tags`,
      );
      const fresh = await dataSource.query<
        { is_direct: boolean; tag_name: string }[]
      >(
        `select n.tag_name, n.is_direct
          from calendar_event_tag_nodes as n
          inner join calendar_events as e on e.id = n.calendar_event_id
          where e.summary = 'Fresh'
          order by n.tag_name`,
      );

      expect(counts?.nodes).toBe(counts?.tags);
      expect(counts?.derived).toBe(counts?.events);
      // The tag the event was given, and the node above it, are derived in
      // the transaction that wrote the event.
      expect(fresh).toStrictEqual(
        expect.arrayContaining([
          { is_direct: true, tag_name: "Instant" },
          { is_direct: false, tag_name: "Temporality" },
        ]),
      );
    });

    it("stores events on the last requested day", async () => {
      expect.hasAssertions();

      await run(
        philadelphia,
        { endDate: "2026-06-10", startDate: "2026-06-01" },
        [detectable("Last day", "2026-06-10T12:00:00Z")],
      );

      await expect(
        calendarEvents.countBy({ summary: "Last day" }),
      ).resolves.toBe(1);
    });
  });
});
