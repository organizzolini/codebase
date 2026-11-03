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

import { PullRequestAncestorIssuesService } from "./pull-request-ancestor-issues.service";
import { PullRequestContextService } from "./pull-request-context.service";
import { PullRequestLabelVocabularyService } from "./pull-request-label-vocabulary.service";
import { PullRequestReportService } from "./pull-request-report.service";
import { PullRequestValidationService } from "./pull-request-validation.service";
import { PullRequestCommand } from "./pull-request.command";

import type { PullRequestContext } from "./pull-request-context.types";

const context: PullRequestContext = {
  assignees: [],
  author: "someone",
  body: "body",
  labels: [],
  number: 12,
  title: "feat: add",
};

describe(PullRequestCommand, () => {
  let command: PullRequestCommand;
  let contextService: PullRequestContextService;
  let vocabulary: PullRequestLabelVocabularyService;
  let parents: PullRequestAncestorIssuesService;
  let report: PullRequestReportService;
  let validation: PullRequestValidationService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PullRequestCommand,
        { provide: LoggerService, useValue: createMock<LoggerService>() },
        {
          provide: PullRequestContextService,
          useValue: createMock<PullRequestContextService>(),
        },
        {
          provide: PullRequestLabelVocabularyService,
          useValue: createMock<PullRequestLabelVocabularyService>(),
        },
        {
          provide: PullRequestAncestorIssuesService,
          useValue: createMock<PullRequestAncestorIssuesService>(),
        },
        {
          provide: PullRequestReportService,
          useValue: createMock<PullRequestReportService>(),
        },
        {
          provide: PullRequestValidationService,
          useValue: createMock<PullRequestValidationService>(),
        },
      ],
    }).compile();

    command = await module.resolve(PullRequestCommand);
    contextService = await module.resolve(PullRequestContextService);
    vocabulary = await module.resolve(PullRequestLabelVocabularyService);
    parents = await module.resolve(PullRequestAncestorIssuesService);
    report = await module.resolve(PullRequestReportService);
    validation = await module.resolve(PullRequestValidationService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockProcessExit();
    vi.mocked(contextService.resolveInvocation).mockReturnValue({
      ok: true,
      value: { eventName: "pull_request", number: "12", writable: true },
    });
    vi.mocked(contextService.fetch).mockReturnValue({
      ok: true,
      value: context,
    });
    vi.mocked(parents.link).mockReturnValue({
      body: "body",
      outcome: { failures: [], lines: ["linked"] },
    });
    vi.mocked(vocabulary.reconcile).mockReturnValue({
      failures: [],
      lines: ["labels"],
    });
    vi.mocked(validation.validate).mockReturnValue([]);
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
        PullRequestCommand,
        { provide: LoggerService, useValue: createMock<LoggerService>() },
        {
          provide: PullRequestContextService,
          useValue: createMock<PullRequestContextService>(),
        },
        {
          provide: PullRequestLabelVocabularyService,
          useValue: createMock<PullRequestLabelVocabularyService>(),
        },
        {
          provide: PullRequestAncestorIssuesService,
          useValue: createMock<PullRequestAncestorIssuesService>(),
        },
        {
          provide: PullRequestReportService,
          useValue: createMock<PullRequestReportService>(),
        },
        {
          provide: PullRequestValidationService,
          useValue: createMock<PullRequestValidationService>(),
        },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("PullRequestCommand");
  });

  it("is defined", () => {
    expect(command).toBeDefined();
  });

  it("writes, reloads, validates, and exits 0 when everything passes", async () => {
    await command.run([]);

    expect(parents.link).toHaveBeenCalledWith(context);
    expect(contextService.fetch).toHaveBeenCalledTimes(2);
    expect(report.compose).toHaveBeenCalledWith({
      outcomes: [],
      writeFailures: [],
      writeLines: ["linked", "labels"],
    });
    expect(report.publish).toHaveBeenCalledWith(["r"]);
    expect(process.exit).not.toHaveBeenCalled();
  });

  it("never writes when the invocation is read-only", async () => {
    vi.mocked(contextService.resolveInvocation).mockReturnValue({
      ok: true,
      value: { eventName: "merge_group", number: "12", writable: false },
    });

    await command.run([]);

    expect(parents.link).not.toHaveBeenCalled();
    expect(vocabulary.reconcile).not.toHaveBeenCalled();
    expect(contextService.fetch).toHaveBeenCalledTimes(1);
  });

  it("exits 1 when a check failed", async () => {
    vi.mocked(report.compose).mockReturnValue({ failureCount: 1, lines: [] });

    await expect(command.run([])).rejects.toThrow("process.exit:1");
  });

  it("exits 1 when the invocation is invalid", async () => {
    vi.mocked(contextService.resolveInvocation).mockReturnValue({
      failure: "bad usage",
      ok: false,
    });

    await expect(command.run(["x"])).rejects.toThrow("process.exit:1");
    expect(report.publish).toHaveBeenCalledWith(["bad usage"]);
  });

  it("exits 1 when the pull request cannot be fetched", async () => {
    vi.mocked(contextService.fetch).mockReturnValue({
      failure: "no pr",
      ok: false,
    });

    await expect(command.run([])).rejects.toThrow("process.exit:1");
  });

  it("exits 1 when the step outputs cannot be written, whatever was thrown", async () => {
    const thrown: unknown = "disk full";

    vi.mocked(contextService.writeStepOutputs).mockImplementation(() => {
      throw thrown;
    });

    await expect(command.run([])).rejects.toThrow("process.exit:1");
    expect(report.publish).toHaveBeenCalledWith([
      expect.stringContaining("disk full"),
    ]);
  });

  it("exits 1 when the step outputs cannot be written", async () => {
    vi.mocked(contextService.writeStepOutputs).mockImplementation(() => {
      throw new Error("disk");
    });

    await expect(command.run([])).rejects.toThrow("process.exit:1");
    expect(report.publish).toHaveBeenCalledWith([
      expect.stringContaining("disk"),
    ]);
  });
});
