import { appendFileSync } from "node:fs";

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

import { PullRequestReportService } from "./pull-request-report.service";

import type { CheckOutcome } from "./pull-request.types";

vi.mock("node:fs", () => ({ appendFileSync: vi.fn() }));

const passing: CheckOutcome = {
  failures: [],
  heading: "h",
  remediationCommands: [],
  successMessage: "✅ ok",
};
const failing: CheckOutcome = {
  failures: ["bad"],
  heading: "❌ heading",
  remediationCommands: ["fix it"],
  successMessage: "✅ unused",
};

describe(PullRequestReportService, () => {
  let service: PullRequestReportService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [PullRequestReportService],
    }).compile();

    service = await module.resolve(PullRequestReportService);
  });

  beforeEach(() => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("is defined", () => {
    expect(service).toBeDefined();
  });

  it("reports a passing check by its success message", () => {
    expect(
      service.compose({
        outcomes: [passing],
        writeFailures: [],
        writeLines: [],
      }),
    ).toStrictEqual({ failureCount: 0, lines: ["✅ ok"] });
  });

  it("reports failures with their remediation, after the write section", () => {
    const report = service.compose({
      outcomes: [failing, passing],
      writeFailures: ["write broke"],
      writeLines: ["wrote"],
    });

    expect(report.failureCount).toBe(2);
    expect(report.lines).toStrictEqual([
      "wrote",
      "- write broke",
      "",
      "❌ heading",
      "",
      "- bad",
      "",
      "🔧 Fix with:",
      "",
      "- fix it",
      "",
      "✅ ok",
    ]);
  });

  it("omits the fix section when there is nothing to run", () => {
    const report = service.compose({
      outcomes: [{ ...failing, remediationCommands: [] }],
      writeFailures: [],
      writeLines: [],
    });

    expect(report.lines).not.toContain("🔧 Fix with:");
  });

  it("echoes and mirrors the report into the step summary", () => {
    vi.stubEnv("GITHUB_STEP_SUMMARY", "summary.md");
    service.publish(["a", "b"]);

    expect(console.info).toHaveBeenCalledTimes(2);
    expect(appendFileSync).toHaveBeenCalledWith("summary.md", "a\nb\n", "utf8");
  });

  it("does not touch the step summary for an empty report", () => {
    vi.stubEnv("GITHUB_STEP_SUMMARY", "summary.md");
    service.publish([]);

    expect(appendFileSync).not.toHaveBeenCalled();
  });

  it("warns when the step summary cannot be written", () => {
    vi.stubEnv("GITHUB_STEP_SUMMARY", "summary.md");
    vi.mocked(appendFileSync).mockImplementationOnce(() => {
      throw new Error("denied");
    });
    service.publish(["a"]);

    expect(console.warn).toHaveBeenCalledExactlyOnceWith(
      "⚠️ Unable to write the report to GITHUB_STEP_SUMMARY",
    );
  });
});
