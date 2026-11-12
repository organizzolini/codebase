import fs from "node:fs";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import { useTemporaryDirectory } from "@codebase/testing";

import {
  DATABASE_TIMEOUT_MILLISECONDS,
  startCaelundasDatabase,
} from "../../../testing/database";

import { NightSkyModule } from "./night-sky.module";
import { NightSkyService } from "./night-sky.service";

import type { NightSkyFiles } from "./night-sky.types";
import type { DatabaseTestingModule } from "@codebase/persistence/testing";

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
  let database: DatabaseTestingModule;
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

    database = await startCaelundasDatabase([LoggerModule, NightSkyModule]);
    service = database.module.get(NightSkyService);
  }, DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await database.close();
  });

  it("writes the stars, the constellations and their segments", async () => {
    await service.ingest(files);

    await expect(
      database.dataSource.query(
        `select hip, magnitude from stars order by hip`,
      ),
    ).resolves.toStrictEqual([
      { hip: "53910", magnitude: 2.3 },
      { hip: "54061", magnitude: 1.8 },
    ]);
    await expect(
      database.dataSource.query(
        `select designation, name, zodiac from constellations`,
      ),
    ).resolves.toStrictEqual([
      { designation: "UMa", name: "Ursa Major", zodiac: false },
    ]);
    await expect(
      database.dataSource.query(
        `select constellation_designation, from_hip, to_hip from constellation_lines`,
      ),
    ).resolves.toStrictEqual([
      { constellation_designation: "UMa", from_hip: "54061", to_hip: "53910" },
    ]);
  });

  it("replaces what an earlier run wrote rather than adding to it", async () => {
    await service.ingest(files);
    const rows = await service.ingest(files);

    expect(rows.stars).toHaveLength(2);
    await expect(
      database.dataSource.query(`select count(*) as count from stars`),
    ).resolves.toStrictEqual([{ count: "2" }]);
  });
});
