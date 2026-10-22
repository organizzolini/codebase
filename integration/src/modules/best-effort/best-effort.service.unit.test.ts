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
import { ProcessRunnerService } from "../process-runner/process-runner.service";

import { BestEffortSnapshotService } from "./best-effort-snapshot.service";
import { BestEffortService } from "./best-effort.service";

describe(BestEffortService, () => {
  let directory: string;
  let service: BestEffortService;
  let ledger: BestEffortLedgerService;
  let snapshots: BestEffortSnapshotService;

  /** A path inside the scratch directory. */
  const at = (name: string): string => path.join(directory, name);

  /** Describes a step to the service through the environment. */
  const describeStep = (step: {
    paths?: string;
    recover?: string;
    run?: string;
  }): void => {
    vi.stubEnv("BEST_EFFORT_LABEL", "Upgrade things");
    vi.stubEnv("BEST_EFFORT_RUN", step.run ?? "true");
    vi.stubEnv("BEST_EFFORT_PATHS", step.paths ?? "");
    vi.stubEnv("BEST_EFFORT_RECOVER", step.recover ?? "");
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BestEffortService,
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        {
          provide: BestEffortLedgerService,
          useValue: createMock<BestEffortLedgerService>(),
        },
        {
          provide: BestEffortSnapshotService,
          useValue: createMock<BestEffortSnapshotService>(),
        },
        {
          provide: ProcessRunnerService,
          useValue: createMock<ProcessRunnerService>(),
        },
      ],
    }).compile();

    service = await module.resolve(BestEffortService);
  });

  beforeEach(async () => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "best-effort-test-"));
    vi.stubEnv("BEST_EFFORT_REPORT", at("report.jsonl"));

    const module = await Test.createTestingModule({
      providers: [
        BestEffortService,
        BestEffortLedgerService,
        BestEffortSnapshotService,
        ProcessRunnerService,
        { provide: ConfigService, useValue: new ConfigService() },
      ],
    }).compile();

    service = await module.resolve(BestEffortService);
    ledger = await module.resolve(BestEffortLedgerService);
    snapshots = await module.resolve(BestEffortSnapshotService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    fs.rmSync(directory, { force: true, recursive: true });
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(service).toBeDefined();
  });

  it("reports a step that succeeds and keeps what it changed", () => {
    expect.hasAssertions();

    describeStep({ paths: at("lock"), run: `echo done > ${at("lock")}` });

    expect(service.attempt().kind).toBe("succeeded");
    expect(fs.readFileSync(at("lock"), "utf8")).toBe("done\n");
    expect(ledger.read()).toStrictEqual([]);
  });

  it("skips a failing step, restoring its files and recording why", () => {
    expect.hasAssertions();

    fs.writeFileSync(at("lock"), "before");
    describeStep({
      paths: at("lock"),
      run: `echo broken > ${at("lock")}; echo 'no such version' >&2; exit 3`,
    });

    const outcome = service.attempt();

    expect(outcome.kind).toBe("skipped");
    expect(fs.readFileSync(at("lock"), "utf8")).toBe("before");
    expect(ledger.read()).toStrictEqual([
      { exitCode: 3, label: "Upgrade things", tail: "no such version" },
    ]);
  });

  it("stops at the first failing command of a script", () => {
    expect.hasAssertions();

    describeStep({
      paths: at("after"),
      run: `false; echo reached > ${at("after")}`,
    });

    expect(service.attempt().kind).toBe("skipped");
    expect(fs.existsSync(at("after"))).toBe(false);
  });

  it("quotes standard output when the failing step printed nothing else", () => {
    expect.hasAssertions();

    describeStep({ run: "echo only on stdout; exit 1" });
    service.attempt();

    expect(ledger.read()[0]?.tail).toBe("only on stdout");
  });

  it("quotes only the last lines of a long failure", () => {
    expect.hasAssertions();

    describeStep({ run: "seq 1 100 >&2; exit 1" });
    service.attempt();

    const lines = ledger.read()[0]?.tail.split("\n") ?? [];

    expect(lines).toHaveLength(20);
    expect(lines.at(-1)).toBe("100");
  });

  it("runs the recovery script after restoring a failed step", () => {
    expect.hasAssertions();

    describeStep({ recover: `touch ${at("recovered")}`, run: "exit 1" });

    expect(service.attempt().kind).toBe("skipped");
    expect(fs.existsSync(at("recovered"))).toBe(true);
  });

  it("does not run the recovery script after a step that succeeds", () => {
    expect.hasAssertions();

    describeStep({ recover: `touch ${at("recovered")}`, run: "true" });
    service.attempt();

    expect(fs.existsSync(at("recovered"))).toBe(false);
  });

  it("stops the run when the recovery script fails", () => {
    expect.hasAssertions();

    describeStep({ recover: "echo cannot rebuild >&2; exit 4", run: "exit 1" });

    const outcome = service.attempt();

    expect(outcome.kind).toBe("unrestored");
    expect("message" in outcome ? outcome.message : "").toContain("exited 4");
    expect(ledger.read()).toStrictEqual([]);
  });

  it("stops the run when a failed step's files cannot be restored", () => {
    expect.hasAssertions();

    vi.spyOn(snapshots, "restore").mockImplementation(() => {
      throw new Error("disk full");
    });
    describeStep({ run: "exit 1" });

    const outcome = service.attempt();

    expect(outcome.kind).toBe("unrestored");
    expect("message" in outcome ? outcome.message : "").toContain("disk full");
    expect(ledger.read()).toStrictEqual([]);
  });

  it("refuses a step with no name", () => {
    expect.hasAssertions();

    describeStep({ run: "true" });
    vi.stubEnv("BEST_EFFORT_LABEL", "");

    expect(service.attempt().kind).toBe("misconfigured");
  });

  it("refuses a step with nothing to run", () => {
    expect.hasAssertions();

    describeStep({ run: "true" });
    vi.stubEnv("BEST_EFFORT_RUN", "");

    expect(service.attempt().kind).toBe("misconfigured");
  });

  it("splits the paths on any whitespace", () => {
    expect.hasAssertions();

    fs.writeFileSync(at("one"), "1");
    fs.writeFileSync(at("two"), "2");
    describeStep({
      paths: `${at("one")}\n  ${at("two")}`,
      run: `echo x > ${at("one")}; echo x > ${at("two")}; exit 1`,
    });
    service.attempt();

    expect(fs.readFileSync(at("one"), "utf8")).toBe("1");
    expect(fs.readFileSync(at("two"), "utf8")).toBe("2");
  });
});
