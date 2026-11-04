import fs from "node:fs";
import path from "node:path";

import { getDataSourceToken } from "@nestjs/typeorm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createSqliteDataSource } from "@codebase/persistence";
import { useTemporaryDirectory } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import {
  DATABASE_ENTITIES,
  DATABASE_MIGRATIONS,
  DATABASE_PROJECT,
} from "../database/database.constants";

import { NightSkyService } from "./night-sky.service";

import type { NightSkyFiles } from "./night-sky.types";
import type { DataSource } from "typeorm";

const CATALOG = [
  '"id","hip","proper","ra","dec","mag","ci"',
  '54060,54061,"Dubhe",11.062130,61.751033,1.81,1.061',
  '53909,53910,"Merak",11.030690,56.382427,2.34,0.033',
  "",
].join("\n");

const CONSTELLATIONS = JSON.stringify({
  features: [{ id: "UMa", properties: { name: "Ursa Major" } }],
});

const LINES = JSON.stringify({
  features: [
    {
      geometry: {
        coordinates: [
          [
            [165.9319, 61.751],
            [165.4604, 56.3824],
          ],
        ],
      },
      id: "UMa",
    },
  ],
});

describe(NightSkyService, () => {
  let dataSource: DataSource;
  const getDirectory = useTemporaryDirectory("night-sky");
  let files: NightSkyFiles;
  let service: NightSkyService;

  beforeAll(async () => {
    const directory = getDirectory();
    files = {
      constellations: path.join(directory, "constellations.json"),
      lines: path.join(directory, "constellations.lines.json"),
      stars: path.join(directory, "hyg.csv"),
    };
    fs.writeFileSync(files.constellations, CONSTELLATIONS);
    fs.writeFileSync(files.lines, LINES);
    fs.writeFileSync(files.stars, CATALOG);

    dataSource = createSqliteDataSource(
      {
        entities: DATABASE_ENTITIES,
        migrations: DATABASE_MIGRATIONS,
        project: DATABASE_PROJECT,
      },
      { CAELUNDAS_SQLITE_DATABASE: ":memory:" },
    );
    await dataSource.initialize();
    await dataSource.runMigrations();

    ({ instance: service } = await buildTestingModule(NightSkyService, {
      providers: [{ provide: getDataSourceToken(), useValue: dataSource }],
    }));
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(NightSkyService, {
      providers: [{ provide: getDataSourceToken(), useValue: dataSource }],
    });

    expect(instance).toBeInstanceOf(NightSkyService);
  });

  it("writes the stars, the constellations and their segments", async () => {
    await service.ingest(files);

    await expect(
      dataSource.query(`select hip, magnitude from star order by hip`),
    ).resolves.toStrictEqual([
      { hip: 53_910, magnitude: 2.3 },
      { hip: 54_061, magnitude: 1.8 },
    ]);
    await expect(
      dataSource.query(`select designation, name, zodiac from constellation`),
    ).resolves.toStrictEqual([
      { designation: "UMa", name: "Ursa Major", zodiac: 0 },
    ]);
    await expect(
      dataSource.query(
        `select constellation_designation, from_hip, to_hip from constellation_line`,
      ),
    ).resolves.toStrictEqual([
      { constellation_designation: "UMa", from_hip: 54_061, to_hip: 53_910 },
    ]);
  });

  it("replaces what an earlier run wrote rather than adding to it", async () => {
    await service.ingest(files);
    const rows = await service.ingest(files);

    expect(rows.stars).toHaveLength(2);
    await expect(
      dataSource.query(`select count(*) as count from star`),
    ).resolves.toStrictEqual([{ count: 2 }]);
  });
});
