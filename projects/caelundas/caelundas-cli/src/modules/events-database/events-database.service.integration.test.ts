import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";

import { createTemporaryDatabase } from "../../../testing/temporary-database.utilities";

import { EventsDatabaseModule } from "./events-database.module";
import { EventsDatabaseService } from "./events-database.service";

import type { TemporaryDatabase } from "../../../testing/temporary-database.types";

// 🧪 Tests

/** The rows of a select over a built file, read the way the browser reads it. */
function select(file: string, sql: string): Record<string, unknown>[] {
  const database = new DatabaseSync(file, { readOnly: true });

  try {
    return database
      .prepare(sql)
      .all()
      .map((row) => ({ ...row }));
  } finally {
    database.close();
  }
}

describe(EventsDatabaseService, () => {
  let directory: string;
  let service: EventsDatabaseService;
  let ingested: TemporaryDatabase;

  beforeAll(async () => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "events-database-"));
    ingested = await createTemporaryDatabase();
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true }),
        LoggerModule,
        EventsDatabaseModule,
      ],
    }).compile();

    service = module.get(EventsDatabaseService);
  });

  afterAll(async () => {
    await ingested.close();
    fs.rmSync(directory, { force: true, recursive: true });
  });

  it("builds the bundle from the seed, in the migration's tables, with the views derived", async () => {
    expect.hasAssertions();

    const output = path.join(directory, "seed", "events.sqlite");

    await expect(service.build({ output, seed: true })).resolves.toBe(output);

    expect(
      select(output, "select count(*) as count from calendar_events"),
    ).toStrictEqual([{ count: 6 }]);
    expect(
      select(output, "select count(*) as count from calendar_events_derived"),
    ).toStrictEqual([{ count: 6 }]);
    expect(
      select(output, "select count(*) as count from tag_nodes")[0]?.["count"],
    ).toBeGreaterThan(0);
    expect(fs.existsSync(`${output}.partial`)).toBe(false);
  });

  it("builds the bundle from the database a run ingested into, by default", async () => {
    expect.hasAssertions();

    await ingested.dataSource.query(
      `insert into calendar_events (id, description, "end", latitude, longitude, "start", summary, timezone) values ('one', 'd', '2026-03-04T15:20:00.000Z', '39.949309', '-75.171690', '2026-03-04T15:20:00.000Z', 'Ingested', 'America/New_York')`,
    );
    const output = path.join(directory, "ingested.sqlite");

    await service.build({ output });

    expect(
      select(
        output,
        "select summary, temporality from calendar_events_derived",
      ),
    ).toStrictEqual([{ summary: "Ingested", temporality: "Instant" }]);
  });

  it("builds from the file --source names", async () => {
    expect.hasAssertions();

    const source = path.join(directory, "source.sqlite");
    const output = path.join(directory, "from-source.sqlite");
    fs.copyFileSync(process.env["CAELUNDAS_SQLITE_DATABASE"] ?? "", source);

    await service.build({ output, source });

    expect(
      select(output, "select count(*) as count from calendar_events"),
    ).toStrictEqual([{ count: 1 }]);
  });

  it("refuses --seed with --source", async () => {
    expect.hasAssertions();

    await expect(
      service.build({ output: "x.sqlite", seed: true, source: "y.sqlite" }),
    ).rejects.toThrow(/takes no --source/u);
  });

  it("stops, naming a source that does not exist, and writes nothing", async () => {
    expect.hasAssertions();

    const source = path.join(directory, "missing.sqlite");
    const output = path.join(directory, "missing-output.sqlite");

    await expect(service.build({ output, source })).rejects.toThrow(source);
    expect(fs.existsSync(output)).toBe(false);
  });

  it("leaves the last good file in place when a build fails", async () => {
    expect.hasAssertions();

    const source = path.join(directory, "not-a-database.sqlite");
    const output = path.join(directory, "kept.sqlite");
    fs.writeFileSync(
      source,
      "not a database, long enough to be read as one".repeat(100),
    );
    fs.writeFileSync(output, "last good");

    await expect(service.build({ output, source })).rejects.toThrow(
      /not a database/u,
    );
    expect(fs.readFileSync(output, "utf8")).toBe("last good");
    expect(fs.existsSync(`${output}.partial`)).toBe(false);
  });
});
