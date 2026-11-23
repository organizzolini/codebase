import { createMock } from "@golevelup/ts-vitest";
import { getRepositoryToken } from "@nestjs/typeorm";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { meanderRecord } from "../../../testing/meanders";

import { DatabaseService } from "./database.service";
import { Characteristic } from "./modules/characteristic/characteristic.entity";
import { Meander } from "./modules/meander/meander.entity";

import type { MeanderRecord } from "./database.types";
import type { TestingModuleOptions } from "@codebase/testing/nestjs";
import type { Repository } from "typeorm";

/** Built with a repository mock in place of Postgres. */
const MODULE_OPTIONS: TestingModuleOptions = {
  providers: [
    {
      provide: getRepositoryToken(Meander),
      useValue: createMock<Repository<Meander>>(),
    },
    {
      provide: getRepositoryToken(Characteristic),
      useValue: createMock<Repository<Characteristic>>(),
    },
  ],
};

// 🧪 Tests

describe(DatabaseService, () => {
  let service: DatabaseService;
  let meanderRepository: Repository<Meander>;

  const record: MeanderRecord = meanderRecord({
    code: "3c9a",
    columns: 2,
    lattice: "3c9a",
    rows: 3,
  });
  const savedMeander = createMock<Meander>({
    id: "01a107d6-cff8-7238-8684-a2a863bc6928",
    ...record,
  });

  beforeAll(async () => {
    const built = await buildTestingModule(DatabaseService, MODULE_OPTIONS);

    service = built.instance;
    meanderRepository = built.module.get(getRepositoryToken(Meander));
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      DatabaseService,
      MODULE_OPTIONS,
    );

    expect(instance).toBeInstanceOf(DatabaseService);
  });

  describe("findOneByCode", () => {
    it("delegates findOneBy with the Code alone", async () => {
      vi.mocked(meanderRepository.findOneBy).mockResolvedValue(savedMeander);

      await expect(service.findOneByCode("02x03y3c9a")).resolves.toStrictEqual(
        savedMeander,
      );
      expect(meanderRepository.findOneBy).toHaveBeenCalledWith({
        code: "02x03y3c9a",
      });
    });
  });
});
