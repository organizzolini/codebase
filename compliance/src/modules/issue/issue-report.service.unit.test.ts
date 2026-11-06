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

import { IssueReportService } from "./issue-report.service";

vi.mock("node:fs", () => ({ appendFileSync: vi.fn() }));

describe(IssueReportService, () => {
  let service: IssueReportService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [IssueReportService],
    }).compile();

    service = await module.resolve(IssueReportService);
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
    vi.stubEnv("GITHUB_STEP_SUMMARY", "summary.md");
    service.publish(["a", "b"]);

    expect(appendFileSync).toHaveBeenCalledWith("summary.md", "a\nb\n", "utf8");
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
