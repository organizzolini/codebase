import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  createTemporaryDirectory,
  overrideEnvironment,
} from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { PullRequestReportService } from "./pull-request-report.service";

import type { CheckOutcome } from "./pull-request.types";

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
    const built = await buildTestingModule(PullRequestReportService);

    service = built.instance;
  });

  beforeEach(() => {
    overrideEnvironment({ GITHUB_STEP_SUMMARY: undefined });
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(PullRequestReportService);

    expect(instance).toBeInstanceOf(PullRequestReportService);
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
    const summary = path.join(createTemporaryDirectory("report"), "summary.md");
    overrideEnvironment({ GITHUB_STEP_SUMMARY: summary });
    service.publish(["a", "b"]);

    expect(console.info).toHaveBeenCalledTimes(2);
    expect(readFileSync(summary, "utf8")).toBe("a\nb\n");
  });

  it("does not touch the step summary for an empty report", () => {
    const summary = path.join(createTemporaryDirectory("report"), "summary.md");
    overrideEnvironment({ GITHUB_STEP_SUMMARY: summary });
    service.publish([]);

    expect(existsSync(summary)).toBe(false);
  });

  it("warns when the step summary cannot be written", () => {
    overrideEnvironment({
      GITHUB_STEP_SUMMARY: path.join(
        createTemporaryDirectory("report"),
        "missing",
        "summary.md",
      ),
    });
    service.publish(["a"]);

    expect(console.warn).toHaveBeenCalledExactlyOnceWith(
      "⚠️ Unable to write the report to GITHUB_STEP_SUMMARY",
    );
  });
});
