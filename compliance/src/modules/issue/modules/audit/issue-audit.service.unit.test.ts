import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { IssueGithubService } from "../github/issue-github.service";
import { IssueMetadataService } from "../metadata/issue-metadata.service";

import { IssueAuditService } from "./issue-audit.service";

import type { TestingModuleOptions } from "@codebase/testing/nestjs";

/** What IssueAuditService is built with. */
const DEPENDENCIES = {
  mocks: [IssueGithubService, IssueMetadataService],
} satisfies TestingModuleOptions;

describe(IssueAuditService, () => {
  let service: IssueAuditService;
  let github: IssueGithubService;
  let metadata: IssueMetadataService;

  beforeAll(async () => {
    const built = await buildTestingModule(IssueAuditService, DEPENDENCIES);

    service = built.instance;
    github = built.mock(IssueGithubService);
    metadata = built.mock(IssueMetadataService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(github.isAvailable).mockReturnValue(true);
    vi.mocked(github.describeFailure).mockReturnValue("HTTP 404");
    vi.mocked(github.readFieldNames).mockReturnValue({
      fieldNames: ["Priority"],
      success: true,
    });
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      IssueAuditService,
      DEPENDENCIES,
    );

    expect(instance).toBeInstanceOf(IssueAuditService);
  });

  it("fails an audit of everything when gh is missing", () => {
    vi.mocked(github.isAvailable).mockReturnValue(false);

    expect(service.auditAll().failures).toHaveLength(1);
  });

  it("fails an audit of everything when the listing fails", () => {
    vi.mocked(github.listOpenIssues).mockReturnValue({
      error: "boom",
      success: false,
    });

    expect(service.auditAll().lines[0]).toContain("boom");
  });

  it("names an unknown error when the listing fails without one", () => {
    vi.mocked(github.listOpenIssues).mockReturnValue({ success: false });

    expect(service.auditAll().lines[0]).toContain("unknown error");
  });

  it("passes when every open issue is compliant", () => {
    vi.mocked(github.listOpenIssues).mockReturnValue({
      issues: [],
      success: true,
    });
    vi.mocked(metadata.checkBulkIssues).mockReturnValue({
      failureCount: 0,
      failures: [],
      hierarchyViolations: [],
      totalIssues: 3,
    });

    expect(service.auditAll()).toStrictEqual({
      failures: [],
      lines: ["✅ All 3 open issues and hierarchy relationships are compliant"],
    });
  });

  it("lists every failure of the sweep", () => {
    vi.mocked(github.listOpenIssues).mockReturnValue({
      issues: [],
      success: true,
    });
    vi.mocked(metadata.checkBulkIssues).mockReturnValue({
      failureCount: 1,
      failures: ["#1 bad"],
      hierarchyViolations: [],
      totalIssues: 3,
    });

    const outcome = service.auditAll();

    expect(outcome.failures).toStrictEqual(["#1 bad"]);
    expect(outcome.lines).toContain("- #1 bad");
  });

  it("fails an audit of one issue when gh is missing", () => {
    vi.mocked(github.isAvailable).mockReturnValue(false);

    expect(service.auditOne("4").failures).toHaveLength(1);
  });

  it("fails an audit of one issue gh cannot read", () => {
    vi.mocked(github.run).mockReturnValue({
      available: true,
      standardError: "",
      standardOutput: "",
      succeeded: false,
    });

    expect(service.auditOne("4").lines[0]).toContain("HTTP 404");
  });

  it("fails an audit of one issue whose document does not resolve", () => {
    vi.mocked(github.run).mockReturnValue({
      available: true,
      standardError: "",
      standardOutput: "{}",
      succeeded: true,
    });
    vi.mocked(metadata.resolveFromDocument).mockReturnValue({
      failure: "❌ unreadable",
      resolved: false,
    });

    expect(service.auditOne("4").failures).toStrictEqual(["❌ unreadable"]);
  });

  describe("an issue that resolves", () => {
    beforeEach(() => {
      vi.mocked(github.run).mockReturnValue({
        available: true,
        standardError: "",
        standardOutput: "{}",
        succeeded: true,
      });
      vi.mocked(metadata.resolveFromDocument).mockReturnValue({
        metadata: { body: "body", labelNames: [] },
        resolved: true,
      });
      vi.mocked(metadata.parseFormAnswers).mockReturnValue({});
    });

    it("passes when the metadata is valid", () => {
      vi.mocked(metadata.checkMetadata).mockReturnValue({
        failures: [],
        remediationCommands: [],
      });

      expect(service.auditOne("4")).toStrictEqual({
        failures: [],
        lines: ["✅ Issue metadata is valid"],
      });
    });

    it("hands the issue fields to the metadata check", () => {
      vi.mocked(metadata.checkMetadata).mockReturnValue({
        failures: [],
        remediationCommands: [],
      });

      service.auditOne("4");

      expect(github.readFieldNames).toHaveBeenCalledWith("4");
      expect(metadata.checkMetadata).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { body: "body", fieldNames: ["Priority"], labelNames: [] },
        }),
      );
    });

    it("fails when the issue fields cannot be read", () => {
      vi.mocked(github.readFieldNames).mockReturnValue({
        error: "HTTP 502",
        success: false,
      });

      expect(service.auditOne("4").failures).toStrictEqual([
        "❌ Unable to read the issue fields of issue 4: HTTP 502",
      ]);
    });

    it("names an unknown error when the field read gives none", () => {
      vi.mocked(github.readFieldNames).mockReturnValue({ success: false });

      expect(service.auditOne("4").failures[0]).toContain("unknown error");
    });

    it("lists the failures without a fix when there is none", () => {
      vi.mocked(metadata.checkMetadata).mockReturnValue({
        failures: ["no type"],
        remediationCommands: [],
      });

      expect(service.auditOne("4").lines).toStrictEqual([
        "❌ Issue metadata is invalid",
        "",
        "- no type",
      ]);
    });

    it("lists the failures and the commands that fix them", () => {
      vi.mocked(metadata.checkMetadata).mockReturnValue({
        failures: ["no type"],
        remediationCommands: ["gh issue edit 4"],
      });

      expect(service.auditOne("4").lines).toStrictEqual([
        "❌ Issue metadata is invalid",
        "",
        "- no type",
        "",
        "🔧 Fix with:",
        "",
        "- gh issue edit 4",
      ]);
    });
  });
});
