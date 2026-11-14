import { MeanderawDatabaseService } from "@codebase/meanderaw-db";
import type { Meander, MeanderRecord } from "@codebase/meanderaw-db";
import { createMock } from "@golevelup/ts-vitest";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";


import { DrawCodeService } from "./draw-code.service";
import { DrawRecordService } from "./draw-record.service";

import type { TestingModuleOptions } from "@codebase/testing/nestjs";

// 🧪 Tests

/**
 * What is left of this service once `DrawRecordService` owns building a row:
 * that a `--code` drawing is recorded as authored by a person rather than
 * found by a search, and that what the builder produced is what reaches the
 * database. What a row actually holds is asserted in
 * `draw-record.service.unit.test.ts`, against the real pipeline rather than
 * against mocks of it.
 */
/** What the class under test is built with. */
const MODULE_OPTIONS: TestingModuleOptions = {
  mocks: [DrawRecordService, MeanderawDatabaseService],
};

describe(DrawCodeService, () => {
  let drawRecordService: DrawRecordService;
  let databaseService: MeanderawDatabaseService;
  let service: DrawCodeService;

  const record = createMock<MeanderRecord>({ code: "2" });
  const savedMeander = createMock<Meander>({
    id: "01a107d6-cff8-7238-8684-a2a863bc6928",
  });

  beforeAll(async () => {
    const built = await buildTestingModule(DrawCodeService, MODULE_OPTIONS);

    service = built.instance;
    drawRecordService = built.mock(DrawRecordService);
    databaseService = built.mock(MeanderawDatabaseService);

    vi.mocked(drawRecordService.record).mockReturnValue(record);
    vi.mocked(databaseService.save).mockResolvedValue(savedMeander);
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      DrawCodeService,
      MODULE_OPTIONS,
    );

    expect(instance).toBeInstanceOf(DrawCodeService);
  });

  describe("draw", () => {
    it("records a code named at the command line as hardcoded, since a person authored it rather than a search finding it", async () => {
      await service.draw({ code: "2", columns: 3, rows: 4 });

      expect(drawRecordService.record).toHaveBeenCalledWith(
        "2",
        { columns: 3, repeats: undefined, rows: 4 },
        true,
      );
    });

    it("supports drawing with self-contained code without explicit rows and columns", async () => {
      await service.draw({ code: "03x04y2" });

      expect(drawRecordService.record).toHaveBeenCalledWith(
        "03x04y2",
        { columns: undefined, repeats: undefined, rows: undefined },
        true,
      );
    });

    it("persists exactly the row the builder produced", async () => {
      await service.draw({ code: "2", columns: 1, rows: 2 });

      expect(databaseService.save).toHaveBeenCalledWith(record);
    });

    it("resolves with the saved meander row", async () => {
      await expect(
        service.draw({ code: "2", columns: 1, rows: 2 }),
      ).resolves.toBe(savedMeander);
    });
  });
});
