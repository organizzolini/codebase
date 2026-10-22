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

import { BestEffortLedgerService } from "../best-effort-ledger/best-effort-ledger.service";

import { BestEffortReportService } from "./best-effort-report.service";

describe(BestEffortReportService, () => {
  let directory: string;
  let ledger: BestEffortLedgerService;
  let service: BestEffortReportService;

  /** A path inside the scratch directory. */
  const at = (name: string): string => path.join(directory, name);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BestEffortReportService,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        {
          provide: BestEffortLedgerService,
          useValue: createMock<BestEffortLedgerService>(),
        },
      ],
    }).compile();

    service = await module.resolve(BestEffortReportService);
  });

  beforeEach(async () => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "report-test-"));
    vi.stubEnv("BEST_EFFORT_REPORT", at("report.jsonl"));
    vi.stubEnv("GITHUB_OUTPUT", at("output"));
    vi.stubEnv("GITHUB_STEP_SUMMARY", at("summary"));

    const module = await Test.createTestingModule({
      providers: [
        BestEffortReportService,
        BestEffortLedgerService,
        { provide: ConfigService, useValue: new ConfigService() },
      ],
    }).compile();

    ledger = await module.resolve(BestEffortLedgerService);
    service = await module.resolve(BestEffortReportService);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    fs.rmSync(directory, { force: true, recursive: true });
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  it("writes up nothing when no step was skipped", () => {
    expect.hasAssertions();
    expect(service.render()).toStrictEqual({
      count: 0,
      details: "",
      section: "",
    });
  });

  it("lists a bullet for each skipped step", () => {
    expect.hasAssertions();

    ledger.append({ exitCode: 1, label: "Upgrade pnpm", tail: "too new" });
    ledger.append({ exitCode: 2, label: "Upgrade Skills", tail: "boom" });

    const { count, details } = service.render();

    expect(count).toBe(2);
    expect(details.split("\n")).toHaveLength(2);
    expect(details).toContain("- ⚠️ Skipped **Upgrade pnpm** (exit 1)");
  });

  it("quotes each failure in a collapsed block under a heading", () => {
    expect.hasAssertions();

    ledger.append({ exitCode: 1, label: "Upgrade pnpm", tail: "too new" });

    const { section } = service.render();

    expect(section).toContain("## ⚠️ Skipped Upgrades");
    expect(section).toContain("<summary>Upgrade pnpm (exit 1)</summary>");
    expect(section).toContain("```text\ntoo new\n```");
  });

  it("does not let a failure's own code fence end the block early", () => {
    expect.hasAssertions();

    ledger.append({ exitCode: 1, label: "Step", tail: "a\n```\nb" });

    expect(service.render().section.match(/```/gu)).toHaveLength(2);
  });

  it("publishes the write-up as step outputs and a summary", () => {
    expect.hasAssertions();

    ledger.append({ exitCode: 1, label: "Upgrade pnpm", tail: "too new" });
    service.publish(service.render());

    const output = fs.readFileSync(at("output"), "utf8");

    expect(output).toMatch(/^count<<EOF_[\w-]+\n1\nEOF_[\w-]+\n/u);
    expect(output).toContain("details<<");
    expect(output).toContain("section<<");
    expect(fs.readFileSync(at("summary"), "utf8")).toContain(
      "Skipped Upgrades",
    );
  });

  it("leaves the summary alone when nothing was skipped", () => {
    expect.hasAssertions();

    service.publish(service.render());

    expect(fs.existsSync(at("summary"))).toBe(false);
  });

  it("publishes nothing outside GitHub Actions", () => {
    expect.hasAssertions();

    vi.stubEnv("GITHUB_OUTPUT", "");
    vi.stubEnv("GITHUB_STEP_SUMMARY", "");
    ledger.append({ exitCode: 1, label: "Step", tail: "x" });
    service.publish(service.render());

    expect(fs.existsSync(at("output"))).toBe(false);
    expect(fs.existsSync(at("summary"))).toBe(false);
  });
});
