import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createMock } from "@golevelup/ts-vitest";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { BestEffortLedgerService } from "./best-effort-ledger.service";

describe(BestEffortLedgerService, () => {
  let directory: string;
  let service: BestEffortLedgerService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BestEffortLedgerService,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
      ],
    }).compile();

    service = await module.resolve(BestEffortLedgerService);
  });

  beforeEach(async () => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "ledger-test-"));
    vi.stubEnv("BEST_EFFORT_REPORT", path.join(directory, "report.jsonl"));

    const module = await Test.createTestingModule({
      providers: [
        BestEffortLedgerService,
        { provide: ConfigService, useValue: new ConfigService() },
      ],
    }).compile();

    service = await module.resolve(BestEffortLedgerService);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    fs.rmSync(directory, { force: true, recursive: true });
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  it("reads nothing before any step is skipped", () => {
    expect.hasAssertions();
    expect(service.read()).toStrictEqual([]);
  });

  it("reads back what was appended, oldest first", () => {
    expect.hasAssertions();

    service.append({ exitCode: 1, label: "Upgrade pnpm", tail: "too new" });
    service.append({ exitCode: 2, label: "Upgrade Skills", tail: "boom" });

    expect(service.read()).toStrictEqual([
      { exitCode: 1, label: "Upgrade pnpm", tail: "too new" },
      { exitCode: 2, label: "Upgrade Skills", tail: "boom" },
    ]);
  });

  it("keeps a tail that spans several lines in one record", () => {
    expect.hasAssertions();

    service.append({ exitCode: 1, label: "Step", tail: "one\ntwo" });

    expect(service.read()).toHaveLength(1);
  });

  it("rejects a record that is not a skipped step", () => {
    expect.hasAssertions();

    fs.writeFileSync(
      path.join(directory, "report.jsonl"),
      `${JSON.stringify({ label: "Step" })}\n`,
    );

    expect(() => service.read()).toThrow(/exitCode/u);
  });
});
