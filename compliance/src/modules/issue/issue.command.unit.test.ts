import { createMock } from "@golevelup/ts-vitest";
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

import { LoggerService } from "@codebase/observability";

import { mockProcessExit } from "../../../testing/mocks";

import { IssueAssigningService } from "./issue-assigning.service";
import { IssueAuditService } from "./issue-audit.service";
import { IssueLabelingService } from "./issue-labeling.service";
import { IssuePlanService } from "./issue-plan.service";
import { IssueReportService } from "./issue-report.service";
import { IssueCommand } from "./issue.command";

import type { IssuePlan } from "./issue.types";

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

describe(IssueCommand, () => {
  let command: IssueCommand;
  let assigning: IssueAssigningService;
  let audit: IssueAuditService;
  let labeling: IssueLabelingService;
  let planning: IssuePlanService;
  let report: IssueReportService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        IssueCommand,
        { provide: LoggerService, useValue: createMock<LoggerService>() },
        {
          provide: IssueAssigningService,
          useValue: createMock<IssueAssigningService>(),
        },
        {
          provide: IssueAuditService,
          useValue: createMock<IssueAuditService>(),
        },
        {
          provide: IssueLabelingService,
          useValue: createMock<IssueLabelingService>(),
        },
        { provide: IssuePlanService, useValue: createMock<IssuePlanService>() },
        {
          provide: IssueReportService,
          useValue: createMock<IssueReportService>(),
        },
      ],
    }).compile();

    command = await module.resolve(IssueCommand);
    assigning = await module.resolve(IssueAssigningService);
    audit = await module.resolve(IssueAuditService);
    labeling = await module.resolve(IssueLabelingService);
    planning = await module.resolve(IssuePlanService);
    report = await module.resolve(IssueReportService);
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
    const module = await Test.createTestingModule({
      providers: [
        IssueCommand,
        { provide: LoggerService, useValue: createMock<LoggerService>() },
        {
          provide: IssueAssigningService,
          useValue: createMock<IssueAssigningService>(),
        },
        {
          provide: IssueAuditService,
          useValue: createMock<IssueAuditService>(),
        },
        {
          provide: IssueLabelingService,
          useValue: createMock<IssueLabelingService>(),
        },
        { provide: IssuePlanService, useValue: createMock<IssuePlanService>() },
        {
          provide: IssueReportService,
          useValue: createMock<IssueReportService>(),
        },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("IssueCommand");
  });

  it("is defined", () => {
    expect(command).toBeDefined();
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
