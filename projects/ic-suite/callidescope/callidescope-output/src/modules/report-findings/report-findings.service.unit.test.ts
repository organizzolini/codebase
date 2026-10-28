import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { captureExitCode } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import {
  buildStackFrame,
  buildTracedCallGraphResult,
} from "../../../testing/mocks";

import { ReportFindingsService } from "./report-findings.service";

import type { ReportFindingsArguments } from "./report-findings.types";
import type { LoggerService } from "@codebase/observability";
import type { DeepMocked } from "@golevelup/ts-vitest";

/** A run mode with every gate off, so a test opts into the one it checks. */
const CLEAN_MODE: ReportFindingsArguments["mode"] = {
  checksBreadth: false,
  checksDepth: false,
  checksReports: false,
  writes: false,
};

describe(ReportFindingsService, () => {
  let exitCode: ReturnType<typeof captureExitCode>;
  let logger: DeepMocked<LoggerService>;
  let service: ReportFindingsService;

  beforeAll(async () => {
    const built = await buildTestingModule(ReportFindingsService);

    service = built.instance;
    logger = built.logger;
  });

  // The service holds no state of its own, so one instance serves the suite;
  // what each test needs fresh is the logger's record and the exit code.
  beforeEach(() => {
    logger.error.mockClear();
    exitCode = captureExitCode();
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(ReportFindingsService);

    expect(instance).toBeInstanceOf(ReportFindingsService);
  });

  it("leaves the exit code alone when nothing was found", () => {
    service.reportFindings({
      mode: CLEAN_MODE,
      result: buildTracedCallGraphResult(),
      stalePaths: [],
    });

    expect(exitCode()).toBeUndefined();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("fails and names a stack that is too deep when depth is checked", () => {
    service.reportFindings({
      mode: { ...CLEAN_MODE, checksDepth: true },
      result: buildTracedCallGraphResult({
        deepStacks: [
          {
            depth: 4,
            entryPointKind: "declared",
            frames: [buildStackFrame({ displayName: "Example.run" })],
            isLowerBound: false,
            limit: 3,
          },
        ],
      }),
      stalePaths: [],
    });

    expect(exitCode()).toBe(1);
    expect(logger.error).toHaveBeenCalledWith(
      "🔭 Found call stacks too deep",
      undefined,
      { count: 1, deepest: 4, entryPoints: ["Example.run"] },
    );
  });

  it("names a stack that is too deep without failing when depth is not checked", () => {
    service.reportFindings({
      mode: CLEAN_MODE,
      result: buildTracedCallGraphResult({
        deepStacks: [
          {
            depth: 4,
            entryPointKind: "declared",
            frames: [buildStackFrame({ displayName: "Example.run" })],
            isLowerBound: false,
            limit: 3,
          },
        ],
      }),
      stalePaths: [],
    });

    expect(exitCode()).toBeUndefined();
    expect(logger.error).toHaveBeenCalledWith(
      "🔭 Found call stacks too deep",
      undefined,
      { count: 1, deepest: 4, entryPoints: ["Example.run"] },
    );
  });

  it("fails and names a callable that calls too much when breadth is checked", () => {
    service.reportFindings({
      mode: { ...CLEAN_MODE, checksBreadth: true },
      result: buildTracedCallGraphResult({
        wideCallables: [
          {
            breadth: 5,
            callees: [],
            displayName: "Example.run",
            id: "packages/example/src/example.ts#0",
            limit: 3,
            location: {
              column: 1,
              filePath: "packages/example/src/example.ts",
              line: 1,
            },
            signature: undefined,
          },
        ],
      }),
      stalePaths: [],
    });

    expect(exitCode()).toBe(1);
    expect(logger.error).toHaveBeenCalledWith(
      "🔭 Found callables calling too much directly",
      undefined,
      { callables: ["Example.run"], count: 1, widest: 5 },
    );
  });

  it("names a wide callable without failing when breadth is not checked", () => {
    service.reportFindings({
      mode: CLEAN_MODE,
      result: buildTracedCallGraphResult({
        wideCallables: [
          {
            breadth: 5,
            callees: [],
            displayName: "Example.run",
            id: "packages/example/src/example.ts#0",
            limit: 3,
            location: {
              column: 1,
              filePath: "packages/example/src/example.ts",
              line: 1,
            },
            signature: undefined,
          },
        ],
      }),
      stalePaths: [],
    });

    // Named as well as not fatal: a run that does not gate on breadth still
    // reports what it found, which is the half of "names a wide callable" an
    // exit code cannot show.
    expect(exitCode()).toBeUndefined();
    expect(logger.error).toHaveBeenCalledWith(
      "🔭 Found callables calling too much directly",
      undefined,
      { callables: ["Example.run"], count: 1, widest: 5 },
    );
  });

  it("fails on a stale report regardless of what is checked", () => {
    service.reportFindings({
      mode: CLEAN_MODE,
      result: buildTracedCallGraphResult(),
      stalePaths: ["report.json"],
    });

    expect(exitCode()).toBe(1);
    expect(logger.error).toHaveBeenCalledWith(
      "🔭 Found stale reports",
      undefined,
      {
        paths: ["report.json"],
      },
    );
  });

  it("fails a trace that collected no callables at all", () => {
    service.reportFindings({
      mode: CLEAN_MODE,
      result: buildTracedCallGraphResult({
        summary: {
          callableCount: 0,
          cyclicComponentCount: 0,
          edgeCount: 0,
          entryPointCount: 0,
          fileCount: 0,
          maximumDepth: 0,
          projectCount: 2,
          unresolvedCallCount: 0,
        },
      }),
      stalePaths: [],
    });

    expect(exitCode()).toBe(1);
    expect(logger.error).toHaveBeenCalledWith("🔭 Traced nothing", undefined, {
      projectCount: 2,
    });
  });
});
