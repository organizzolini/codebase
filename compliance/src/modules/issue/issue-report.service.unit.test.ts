import { readFileSync } from "node:fs";
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

import { IssueReportService } from "./issue-report.service";

describe(IssueReportService, () => {
  let service: IssueReportService;

  beforeAll(async () => {
    const built = await buildTestingModule(IssueReportService);

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
    const { instance } = await buildTestingModule(IssueReportService);

    expect(instance).toBeInstanceOf(IssueReportService);
  });

  it("separates phases with a blank line and counts failures", () => {
    const report = service.compose([
      { failures: [], lines: ["first"] },
      { failures: [], lines: [] },
      { failures: ["bad"], lines: ["second", "bad"] },
    ]);

    expect(report).toStrictEqual({
      failureCount: 1,
      lines: ["first", "", "second", "bad"],
    });
  });

  it("echoes every line", () => {
    service.publish(["a", "b"]);

    expect(console.info).toHaveBeenCalledTimes(2);
  });

  it("mirrors the report into the step summary", () => {
    const summary = path.join(createTemporaryDirectory("report"), "summary.md");
    overrideEnvironment({ GITHUB_STEP_SUMMARY: summary });
    service.publish(["a", "b"]);

    expect(readFileSync(summary, "utf8")).toBe("a\nb\n");
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
