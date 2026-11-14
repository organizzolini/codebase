import { mkdir, writeFile } from "node:fs/promises";

import { createMock } from "@golevelup/ts-vitest";
import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from "vitest";

import { MeanderawDatabaseService } from "@codebase/meanderaw-db";
import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { CharacteristicsService } from "../characteristics/characteristics.service";
import { CorpusService } from "../corpus/corpus.service";

import { DrawCodeService } from "./draw-code.service";
import { DrawEnumerationService } from "./draw-enumeration.service";
import { DrawIndexService } from "./draw-index.service";
import { DrawCommand } from "./draw.command";

import type { MeanderPageContent } from "./draw-index.types";
import type { CharacteristicRecord, Meander } from "@codebase/meanderaw-db";
import type * as FileSystemHelpers from "@codebase/testing/file-system";
import type {
  BuiltTestingModule,
  TestingModuleOptions,
} from "@codebase/testing/nestjs";

vi.mock("node:fs/promises", async () => {
  const { mockFileSystem } = await vi.importActual<typeof FileSystemHelpers>(
    "@codebase/testing/file-system",
  );

  return mockFileSystem();
});

/**
 * Covers what `DrawCommand` decides rather than what it produces: which of
 * its modes an option set selects — a draw run by default, and one drawing when
 * `--code` names it — how each flag is parsed, and that the draw run writes
 * `DrawIndexService`'s own built pages, once both halves have committed.
 *
 * Everything else the command produces is asserted against a real database
 * instead — `draw-run.command.integration.test.ts` for the draw run and
 * `draw.command.integration.test.ts` for the `--code` path — per spec #813's
 * Testing Decisions. `node:fs/promises` is mocked here rather than left real,
 * the same way this file used to mock it while the procedural
 * pipeline still wrote a whole tree through it: a unit test has no business
 * touching a real file, and it is what says which pages are written.
 */
/** Two pages as `DrawIndexService.build` hands them over: each an iterable of pieces. */
const indexPage = ["<!doctype html>"];
const patternPage = ["<section></section>"];

describe(DrawCommand, () => {
  let build: Mock<() => Promise<Record<string, MeanderPageContent>>>;
  let clear: Mock<() => Promise<void>>;
  let catalog: readonly CharacteristicRecord[];
  let command: DrawCommand;
  let draw: Mock<() => Promise<Meander>>;
  let ingest: Mock<() => Promise<Meander[]>>;
  let drawAll: Mock<() => Promise<number>>;
  let syncCharacteristics: Mock<
    (entries: readonly CharacteristicRecord[]) => Promise<void>
  >;
  let logger: BuiltTestingModule<DrawCommand>["logger"];

  /** `DrawCommand` collaborators, answering with the mocks above. */
  const moduleOptions = (): TestingModuleOptions => ({
    providers: [
      {
        provide: DrawCodeService,
        useValue: createMock<DrawCodeService>({ draw }),
      },
      {
        provide: DrawEnumerationService,
        useValue: createMock<DrawEnumerationService>({ drawAll }),
      },
      {
        provide: DrawIndexService,
        useValue: createMock<DrawIndexService>({ build }),
      },
      {
        provide: CharacteristicsService,
        useValue: createMock<CharacteristicsService>({
          catalog: () => catalog,
        }),
      },
      {
        provide: CorpusService,
        useValue: createMock<CorpusService>({ ingest }),
      },
      {
        provide: MeanderawDatabaseService,
        useValue: createMock<MeanderawDatabaseService>({
          clear,
          syncCharacteristics,
        }),
      },
    ],
  });

  beforeAll(async () => {
    build = vi
      .fn<() => Promise<Record<string, MeanderPageContent>>>()
      .mockResolvedValue({
        "index.html": indexPage,
        "patterns/isSnake.html": patternPage,
      });
    clear = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    draw = vi
      .fn<() => Promise<Meander>>()
      .mockResolvedValue(
        createMock<Meander>({ id: "01a107d6-cff8-7238-8684-a2a863bc6928" }),
      );
    ingest = vi.fn<() => Promise<Meander[]>>().mockResolvedValue([]);
    drawAll = vi.fn<() => Promise<number>>().mockResolvedValue(30_279);
    syncCharacteristics = vi
      .fn<(entries: readonly CharacteristicRecord[]) => Promise<void>>()
      .mockResolvedValue(undefined);
    catalog = [
      {
        category: "path",
        description: "Counts forks.",
        documentationUrl: null,
        formula: null,
        isPattern: false,
        key: "forkCount",
        name: "Fork Count",
        valueType: "number",
      },
    ];

    const built = await buildTestingModule(DrawCommand, moduleOptions());

    command = built.instance;
    logger = built.logger;
  });

  beforeEach(() => {
    build.mockClear();
    clear.mockClear();
    draw.mockClear();
    ingest.mockClear();
    drawAll.mockClear();
    syncCharacteristics.mockClear();
    vi.mocked(writeFile).mockClear();
    vi.mocked(mkdir).mockClear();
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(DrawCommand, moduleOptions());

    expect(instance).toBeInstanceOf(DrawCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(DrawCommand, moduleOptions());
  });

  it("registers the evaluators' catalog before drawing a run or a single Code, so every value written has a row to point at", async () => {
    await command.run([], {});
    await command.run([], { code: "3c9a", columns: 2, rows: 3 });

    expect(syncCharacteristics).toHaveBeenCalledTimes(2);
    expect(syncCharacteristics).toHaveBeenCalledWith(catalog);

    const [synced] = syncCharacteristics.mock.invocationCallOrder;
    const [cleared] = clear.mock.invocationCallOrder;

    expect(synced ?? Infinity).toBeLessThan(cleared ?? 0);
  });

  it("clears the existing rows before drawing, so a draw run regenerates rather than colliding with them", async () => {
    await command.run([], {});

    const [cleared] = clear.mock.invocationCallOrder;
    const [enumerated] = drawAll.mock.invocationCallOrder;

    expect(clear).toHaveBeenCalledTimes(1);
    expect(cleared ?? Infinity).toBeLessThan(enumerated ?? 0);
  });

  it("draws both halves of the corpus when no Code is named, with no flag at all", async () => {
    await command.run([], {});

    expect(drawAll).toHaveBeenCalledTimes(1);
    expect(ingest).toHaveBeenCalledTimes(1);
    expect(draw).not.toHaveBeenCalled();
  });

  it("ingests the hardcoded corpus before enumerating, so a hardcoded row wins over an enumerated meander with its Code", async () => {
    await command.run([], {});

    const [enumerated] = drawAll.mock.invocationCallOrder;
    const [hardcoded] = ingest.mock.invocationCallOrder;

    expect(hardcoded).toBeLessThan(enumerated ?? 0);
  });

  it("logs how many hardcoded rows the corpus wrote, counting entries that share a Code's row once", async () => {
    const shared = createMock<Meander>({
      id: "01a107d6-cff8-7238-8684-a2a863bc6928",
    });
    const single = createMock<Meander>({
      id: "01a107d6-cff8-7238-8684-a2a863bc6929",
    });

    ingest.mockResolvedValueOnce([shared, single, shared]);
    await command.run([], {});

    expect(logger.log).toHaveBeenCalledWith(
      "✨ Ingested the historical corpus",
      undefined,
      { hardcoded: 2 },
    );
    expect(logger.log).toHaveBeenCalledWith(
      "✨ Generated every meander",
      undefined,
      { enumerated: 30_279, hardcoded: 2, total: 30_281 },
    );
  });

  it("rebuilds the index pages from the draw run's own rows, once both halves have committed", async () => {
    await command.run([], {});

    expect(build).toHaveBeenCalledTimes(1);
    expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
      expect.stringMatching(/output\/index\.html$/),
      indexPage,
    );
    expect(vi.mocked(writeFile)).toHaveBeenCalledWith(
      expect.stringMatching(/output\/patterns\/isSnake\.html$/),
      patternPage,
    );

    const [enumerated] = drawAll.mock.invocationCallOrder;
    const [written] = vi.mocked(writeFile).mock.invocationCallOrder;

    expect(enumerated ?? 0).toBeLessThan(written ?? 0);
  });

  it("draws the one meander a Code names, drawing nothing else and never rebuilding the index pages", async () => {
    await command.run([], { code: "3c9a", columns: 2, rows: 3 });

    expect(draw).toHaveBeenCalledWith({ code: "3c9a", columns: 2, rows: 3 });
    expect(clear).not.toHaveBeenCalled();
    expect(drawAll).not.toHaveBeenCalled();
    expect(build).not.toHaveBeenCalled();
    expect(vi.mocked(writeFile)).not.toHaveBeenCalled();
  });

  it("draws a self-contained formatted Code without requiring --rows and --columns", async () => {
    await command.run([], { code: "02x03y3c9a" });

    expect(draw).toHaveBeenCalledWith({
      code: "02x03y3c9a",
      columns: undefined,
      rows: undefined,
    });
    expect(drawAll).not.toHaveBeenCalled();
  });

  it("refuses a Code given without both --rows and --columns", async () => {
    await expect(command.run([], { code: "0", rows: 2 })).rejects.toThrow(
      /needs both --rows and --columns/,
    );
    await expect(command.run([], { code: "0", columns: 1 })).rejects.toThrow(
      /needs both --rows and --columns/,
    );
    expect(draw).not.toHaveBeenCalled();
  });

  it("parses each option the command still takes", () => {
    expect(command.parseCode("3c9a")).toBe("3c9a");
    expect(command.parseColumns("2")).toBe(2);
    expect(command.parseRows("3")).toBe(3);
  });
});
