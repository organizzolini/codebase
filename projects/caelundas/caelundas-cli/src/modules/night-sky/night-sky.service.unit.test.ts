import fs from "node:fs";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { getDataSourceToken } from "@nestjs/typeorm";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { Constellation, ConstellationLine, Star } from "@codebase/caelundas-db";
import { useTemporaryDirectory } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { POSTGRES_MAXIMUM_PARAMETERS } from "../../caelundas-cli.constants";

import { NightSkyService } from "./night-sky.service";

import type { NightSkyFiles } from "./night-sky.types";
import type { EntityManager } from "typeorm";

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
  const manager = createMock<EntityManager>();
  const getDirectory = useTemporaryDirectory("night-sky");
  let files: NightSkyFiles;
  let service: NightSkyService;

  const testingModuleOptions = {
    providers: [
      {
        provide: getDataSourceToken(),
        useValue: {
          transaction: async (
            work: (transaction: EntityManager) => Promise<unknown>,
          ): Promise<unknown> => work(manager),
        },
      },
    ],
  };

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

    ({ instance: service } = await buildTestingModule(
      NightSkyService,
      testingModuleOptions,
    ));
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      NightSkyService,
      testingModuleOptions,
    );

    expect(instance).toBeInstanceOf(NightSkyService);
  });

  it("empties the tables segments first, then writes the stars before the segments that join them", async () => {
    const rows = await service.ingest(files);
    const deletion = manager.createQueryBuilder().delete();

    expect(rows.stars).toHaveLength(2);
    expect(deletion.from).toHaveBeenNthCalledWith(1, ConstellationLine);
    expect(deletion.from).toHaveBeenNthCalledWith(2, Constellation);
    expect(deletion.from).toHaveBeenNthCalledWith(3, Star);
    expect(manager.insert).toHaveBeenNthCalledWith(1, Star, expect.any(Array));
    expect(manager.insert).toHaveBeenNthCalledWith(
      2,
      Constellation,
      expect.any(Array),
    );
    expect(manager.insert).toHaveBeenNthCalledWith(
      3,
      ConstellationLine,
      expect.any(Array),
    );
  });

  it("splits a catalog wider than one statement allows into batches under the parameter limit", async () => {
    const count = 14_000;
    const catalog = [
      '"id","hip","proper","ra","dec","mag","ci"',
      ...Array.from(
        { length: count },
        (_value, index) =>
          `${String(index + 1)},${String(index + 1)},"",1.5,10,3,0.5`,
      ),
    ].join("\n");
    fs.writeFileSync(files.stars, catalog);
    vi.mocked(manager.insert).mockClear();

    await service.ingest(files);
    const starBatches = vi
      .mocked(manager.insert)
      .mock.calls.filter(([target]) => target === Star)
      .map(([, rows]) => rows as readonly unknown[]);

    expect(starBatches.length).toBeGreaterThan(1);
    expect(starBatches.flat()).toHaveLength(count);

    for (const rows of starBatches) {
      expect(rows.length * 5).toBeLessThanOrEqual(POSTGRES_MAXIMUM_PARAMETERS);
    }
  });
});
