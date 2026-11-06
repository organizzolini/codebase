import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import moment from "moment-timezone";
import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DatabaseModule } from "./database.module";
import { DatabaseService } from "./database.service";
import { CalendarEventDerived } from "./entities/calendar-event-derived.entity";
import { CalendarEventTagNode } from "./entities/calendar-event-tag-node.entity";
import { CalendarEventTag } from "./entities/calendar-event-tag.entity";
import { CalendarEvent } from "./entities/calendar-event.entity";
import { TagNode } from "./entities/tag-node.entity";
import { Tag } from "./entities/tag.entity";

import type { TestingModule } from "@nestjs/testing";
import type { TreeRepository } from "typeorm";

// 🧪 Tests

describe(DatabaseModule, () => {
  /**
   * The schema end to end, against a temporary SQLite file: the module runs the
   * one migration, the base rows are written the way the CLI writes them, the
   * refresh rebuilds the derived tag tables, and the derived tables and the view
   * are read back through their entities.
   */
  describe("the caelundas schema", () => {
    const directory = mkdtempSync(path.join(tmpdir(), "caelundas-schema-"));
    let dataSource: DataSource;
    let module: TestingModule;

    /** Saves a tag under `parent`, which keeps the closure table in step. */
    async function saveTag(
      tags: TreeRepository<Tag>,
      name: string,
      parent?: Tag,
    ): Promise<Tag> {
      return tags.save(tags.create({ name, parent: parent ?? null }));
    }

    /** Saves an event that lasts from `start` to `end`, carrying `tag`. */
    async function saveEvent(
      summary: string,
      [start, end]: [string, string],
      tag: Tag,
    ): Promise<CalendarEvent> {
      const event = await dataSource.getRepository(CalendarEvent).save({
        description: summary,
        end: moment.utc(end),
        latitude: "40.000000",
        longitude: "-70.000000",
        start: moment.utc(start),
        summary,
        timezone: "America/New_York",
      });
      await dataSource
        .getRepository(CalendarEventTag)
        .save({ calendarEventId: event.id, tagId: tag.id });

      return event;
    }

    beforeAll(async () => {
      module = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            ignoreEnvFile: true,
            isGlobal: true,
            load: [
              () => ({
                CAELUNDAS_SQLITE_DATABASE: path.join(
                  directory,
                  "caelundas.sqlite",
                ),
              }),
            ],
          }),
          DatabaseModule,
        ],
      }).compile();
      dataSource = module.get(DataSource);

      const tags = dataSource.getTreeRepository(Tag);
      const aspects = await saveTag(tags, "aspects");
      const major = await saveTag(tags, "major", aspects);
      const conjunction = await saveTag(tags, "conjunction", major);
      const planets = await saveTag(tags, "planets");
      const mars = await saveTag(tags, "mars", planets);

      await saveEvent(
        "Sun conjunct Moon",
        ["2026-03-04T14:00:00.000Z", "2026-03-04T15:20:00.000Z"],
        conjunction,
      );
      await saveEvent(
        "Mars ingress",
        ["2026-03-05T09:00:00.000Z", "2026-03-05T09:00:00.000Z"],
        mars,
      );
      await saveEvent(
        "Sun sextile Venus",
        ["2026-04-01T00:00:00.000Z", "2026-04-01T01:00:00.000Z"],
        major,
      );

      await module.get(DatabaseService).refreshReadModel(dataSource.manager);
    });

    afterAll(async () => {
      await module.close();
      rmSync(directory, { force: true, recursive: true });
    });

    it("derives every tag's depth, root and path", async () => {
      expect.hasAssertions();

      const nodes = await dataSource
        .getRepository(TagNode)
        .find({ order: { path: "ASC" } });

      expect(
        nodes.map(({ depth, name, path: tagPath }) => [name, depth, tagPath]),
      ).toStrictEqual([
        ["aspects", 0, "aspects"],
        ["major", 1, "aspects / major"],
        ["conjunction", 2, "aspects / major / conjunction"],
        ["planets", 0, "planets"],
        ["mars", 1, "planets / mars"],
      ]);
      expect(nodes.find(({ name }) => name === "conjunction")?.rootId).toBe(
        nodes.find(({ name }) => name === "aspects")?.id,
      );
    });

    it("derives a row for each event and tag it carries, ancestors included", async () => {
      expect.hasAssertions();

      const rows = await dataSource.getRepository(CalendarEventTagNode).find();
      const events = await dataSource.getRepository(CalendarEvent).find();
      const summaryOf = new Map(events.map(({ id, summary }) => [id, summary]));

      expect(
        rows
          .map(({ calendarEventId, isDirect, tagDepth, tagPath }) => ({
            depth: tagDepth,
            direct: isDirect,
            path: tagPath,
            summary: summaryOf.get(calendarEventId),
          }))
          .toSorted(
            (a, b) =>
              String(a.summary).localeCompare(String(b.summary)) ||
              a.depth - b.depth,
          )
          .map(({ direct, path: tagPath, summary }) => [
            summary,
            tagPath,
            direct,
          ]),
      ).toStrictEqual([
        ["Mars ingress", "planets", 0],
        ["Mars ingress", "planets / mars", 1],
        ["Sun conjunct Moon", "aspects", 0],
        ["Sun conjunct Moon", "aspects / major", 0],
        ["Sun conjunct Moon", "aspects / major / conjunction", 1],
        ["Sun sextile Venus", "aspects", 0],
        ["Sun sextile Venus", "aspects / major", 1],
      ]);
    });

    it("derives each event's times in the view", async () => {
      expect.hasAssertions();

      const rows = await dataSource
        .getRepository(CalendarEventDerived)
        .find({ order: { start: "ASC" } });

      expect(
        rows.map(
          ({
            durationMinutes,
            startDay,
            startHour,
            startMonth,
            startQuarter,
            startYear,
            summary,
            temporality,
          }) => ({
            durationMinutes,
            startDay,
            startHour,
            startMonth,
            startQuarter,
            startYear,
            summary,
            temporality,
          }),
        ),
      ).toStrictEqual([
        {
          durationMinutes: 80,
          startDay: "2026-03-04",
          startHour: 14,
          startMonth: 3,
          startQuarter: 1,
          startYear: 2026,
          summary: "Sun conjunct Moon",
          temporality: "Duration",
        },
        {
          durationMinutes: 0,
          startDay: "2026-03-05",
          startHour: 9,
          startMonth: 3,
          startQuarter: 1,
          startYear: 2026,
          summary: "Mars ingress",
          temporality: "Instant",
        },
        {
          durationMinutes: 60,
          startDay: "2026-04-01",
          startHour: 0,
          startMonth: 4,
          startQuarter: 2,
          startYear: 2026,
          summary: "Sun sextile Venus",
          temporality: "Duration",
        },
      ]);
    });
  });

  /** A `:memory:` database exists once per connection, so `forRoot` must open exactly one. */
  describe("databaseModule.forRoot on :memory:", () => {
    let module: TestingModule;

    beforeAll(async () => {
      module = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            ignoreEnvFile: true,
            isGlobal: true,
            load: [() => ({ CAELUNDAS_SQLITE_DATABASE: ":memory:" })],
          }),
          DatabaseModule,
        ],
      }).compile();
    });

    afterAll(async () => {
      await module.close();
    });

    it("queries a migrated table through the one connection", async () => {
      expect.hasAssertions();

      const rows = await module
        .get(DataSource)
        .query<{ count: number }[]>("select count(*) as count from tag_nodes");

      expect(rows).toStrictEqual([{ count: 0 }]);
    });
  });
});
