import { createMock } from "@golevelup/ts-vitest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { buildTile } from "../../../testing/tiles";
import { CodeService } from "../code/code.service";
import { TileEnumerationService } from "../enumeration/tile-enumeration.service";
import { SymmetryService } from "../symmetry/symmetry.service";

import { DrawRecordService } from "./draw-record.service";
import { DrawWorkerService } from "./draw-worker.service";

import type { MeanderRecord } from "../database/database.types";
import type { TestingModuleOptions } from "@codebase/testing/nestjs";

/** What the class under test is built with. */
const MODULE_OPTIONS: TestingModuleOptions = {
  mocks: [
    CodeService,
    DrawRecordService,
    SymmetryService,
    TileEnumerationService,
  ],
};

describe(DrawWorkerService, () => {
  let service: DrawWorkerService;
  let codeService: CodeService;
  let drawRecordService: DrawRecordService;
  let symmetryService: SymmetryService;
  let tileEnumerationService: TileEnumerationService;

  const shape = { columns: 1, rows: 3 };
  const tile = buildTile(["s", ".", "."]);
  const representative = buildTile([".", "s", "."]);
  const record = createMock<MeanderRecord>({ code: "01x03y048" });

  beforeAll(async () => {
    const built = await buildTestingModule(DrawWorkerService, MODULE_OPTIONS);

    service = built.instance;
    codeService = built.mock(CodeService);
    drawRecordService = built.mock(DrawRecordService);
    symmetryService = built.mock(SymmetryService);
    tileEnumerationService = built.mock(TileEnumerationService);
  });

  beforeEach(() => {
    vi.mocked(tileEnumerationService.tile).mockReturnValue(tile);
    vi.mocked(symmetryService.canonicalTile).mockReturnValue(representative);
    vi.mocked(codeService.spell).mockReturnValue("01x03y048");
    vi.mocked(drawRecordService.record).mockReturnValue(record);
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      DrawWorkerService,
      MODULE_OPTIONS,
    );

    expect(instance).toBeInstanceOf(DrawWorkerService);
  });

  describe("records", () => {
    it("draws each mask's class representative, recorded as enumerated rather than hardcoded", () => {
      service.records(shape, [2]);

      expect(tileEnumerationService.tile).toHaveBeenCalledWith(shape, 2);
      expect(symmetryService.canonicalTile).toHaveBeenCalledWith(tile);
      expect(codeService.spell).toHaveBeenCalledWith(representative);
      expect(drawRecordService.record).toHaveBeenCalledWith(
        "01x03y048",
        shape,
        false,
      );
    });

    it("records one row per mask, in mask order", () => {
      expect(service.records(shape, [2, 4])).toStrictEqual([record, record]);
    });
  });
});
