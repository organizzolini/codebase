import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { mockProcessExit } from "../../../testing/mocks";

import { IssueAssigningService } from "./issue-assigning.service";
import { IssueAuditService } from "./issue-audit.service";
import { IssueLabelingService } from "./issue-labeling.service";
import { IssuePlanService } from "./issue-plan.service";
import { IssueReportService } from "./issue-report.service";
import { IssueCommand } from "./issue.command";

import type { IssuePlan } from "./issue.types";
import type { TestingModuleOptions } from "@codebase/testing/nestjs";

const plan: IssuePlan = {
  allIssues: false,
  body: "b",
  labelNames: [],
  needsAssignee: true,
  newlyOpened: true,
  number: "7",
  writable: true,
};
const outcome = { failures: [], lines: ["x"] };

/** What IssueCommand is built with. */
const DEPENDENCIES = {
  mocks: [
    IssueAssigningService,
    IssueAuditService,
    IssueLabelingService,
    IssuePlanService,
    IssueReportService,
  ],
} satisfies TestingModuleOptions;

describe(IssueCommand, () => {
  let command: IssueCommand;
  let assigning: IssueAssigningService;
  let audit: IssueAuditService;
  let labeling: IssueLabelingService;
  let planning: IssuePlanService;
  let report: IssueReportService;

  beforeAll(async () => {
    const built = await buildTestingModule(IssueCommand, DEPENDENCIES);

    command = built.instance;
    assigning = built.mock(IssueAssigningService);
    audit = built.mock(IssueAuditService);
    labeling = built.mock(IssueLabelingService);
    planning = built.mock(IssuePlanService);
    report = built.mock(IssueReportService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockProcessExit();
    vi.mocked(planning.resolve).mockReturnValue({ ok: true, plan });
    vi.mocked(labeling.label).mockReturnValue(["labeled"]);
    vi.mocked(assigning.assign).mockReturnValue(outcome);
    vi.mocked(assigning.assignAll).mockReturnValue(outcome);
    vi.mocked(audit.auditOne).mockReturnValue(outcome);
    vi.mocked(audit.auditAll).mockReturnValue(outcome);
    vi.mocked(report.compose).mockReturnValue({
      failureCount: 0,
      lines: ["r"],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sets logger context", async () => {
    await expectLoggerContext(IssueCommand, DEPENDENCIES);
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(IssueCommand, DEPENDENCIES);

    expect(instance).toBeInstanceOf(IssueCommand);
  });

  it("parses the all option", () => {
    expect(command.parseAllOption()).toBe(true);
  });

  it("labels, assigns, and audits one new issue", async () => {
    await command.run(["7"]);

    expect(labeling.label).toHaveBeenCalledExactlyOnceWith({
      body: "b",
      existingLabelNames: [],
      issueNumber: "7",
    });
    expect(assigning.assign).toHaveBeenCalledWith("7");
    expect(audit.auditOne).toHaveBeenCalledWith("7");
    expect(audit.auditAll).not.toHaveBeenCalled();
    expect(report.publish).toHaveBeenCalledWith(["r"]);
  });

  it("only audits when the plan is read-only", async () => {
    vi.mocked(planning.resolve).mockReturnValue({
      ok: true,
      plan: { ...plan, writable: false },
    });

    await command.run(["7"]);

    expect(labeling.label).not.toHaveBeenCalled();
    expect(assigning.assign).not.toHaveBeenCalled();
    expect(audit.auditOne).toHaveBeenCalledExactlyOnceWith("7");
  });

  it("skips labeling and assigning an issue that needs neither", async () => {
    vi.mocked(planning.resolve).mockReturnValue({
      ok: true,
      plan: { ...plan, needsAssignee: false, newlyOpened: false },
    });

    await command.run(["7"]);

    expect(labeling.label).not.toHaveBeenCalled();
    expect(assigning.assign).not.toHaveBeenCalled();
  });

  it("assigns and audits every open issue", async () => {
    vi.mocked(planning.resolve).mockReturnValue({
      ok: true,
      plan: {
        ...plan,
        allIssues: true,
        newlyOpened: false,
      },
    });

    await command.run([], { all: true });

    expect(assigning.assignAll).toHaveBeenCalledTimes(1);
    expect(audit.auditAll).toHaveBeenCalledTimes(1);
  });

  it("does not assign every issue without write permission", async () => {
    vi.mocked(planning.resolve).mockReturnValue({
      ok: true,
      plan: { ...plan, allIssues: true, writable: false },
    });

    await command.run([], { all: true });

    expect(assigning.assignAll).not.toHaveBeenCalled();
    expect(audit.auditAll).toHaveBeenCalledTimes(1);
  });

  it("exits 1 when a phase failed", async () => {
    vi.mocked(report.compose).mockReturnValue({ failureCount: 1, lines: [] });

    await expect(command.run(["7"])).rejects.toThrow("process.exit:1");
  });

  it("reports an unresolvable plan as a failure", async () => {
    vi.mocked(planning.resolve).mockReturnValue({ failure: "bad", ok: false });

    await command.run([]);

    expect(report.compose).toHaveBeenCalledWith([
      { failures: ["bad"], lines: ["bad"] },
    ]);
  });
});
