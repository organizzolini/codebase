import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/observability";

import { mockProcessExit } from "../../../testing/mocks";

import { AuditFilesCommand } from "./audit-files.command";
import { AuditFilesService } from "./audit-files.service";

describe(AuditFilesCommand, () => {
  let command: AuditFilesCommand;
  let service: AuditFilesService;
  let logger: LoggerService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuditFilesCommand,
        {
          provide: AuditFilesService,
          useValue: createMock<AuditFilesService>(),
        },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    command = await module.resolve(AuditFilesCommand);
    service = await module.resolve(AuditFilesService);
    logger = await module.resolve(LoggerService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("is defined", () => {
    expect.hasAssertions();

    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    const module = await Test.createTestingModule({
      providers: [
        AuditFilesCommand,
        {
          provide: AuditFilesService,
          useValue: createMock<AuditFilesService>(),
        },
        {
          provide: LoggerService,
          useValue: createMock<LoggerService>(),
        },
      ],
    }).compile();

    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("AuditFilesCommand");
  });

  it("logs success and does not exit when governance is valid", async () => {
    expect.hasAssertions();

    const exitSpy = mockProcessExit();

    vi.mocked(service.checkFiles).mockReturnValue({
      codeowners: {
        filePath: ".github/CODEOWNERS",
        ruleCount: 1,
        valid: true,
        violations: [],
      },
      valid: true,
      workflows: {
        valid: true,
        violations: [],
        workflowsAudited: 7,
      },
    });

    await command.run();

    expect(exitSpy).not.toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith(
      expect.stringContaining("Completed repository governance audit."),
    );
  });

  it("logs violations and exits with 1 when codeowners is invalid", async () => {
    expect.hasAssertions();

    const exitSpy = mockProcessExit();

    vi.mocked(service.checkFiles).mockReturnValue({
      codeowners: {
        ruleCount: 0,
        valid: false,
        violations: [
          {
            line: 1,
            reason: "Invalid handle",
            rule: "* invalid",
          },
        ],
      },
      valid: false,
      workflows: {
        valid: true,
        violations: [],
        workflowsAudited: 7,
      },
    });

    await expect(command.run()).rejects.toThrow("process.exit:1");
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("Discovered CODEOWNERS governance violations."),
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("logs violations and exits with 1 when workflows have security issues", async () => {
    expect.hasAssertions();

    const exitSpy = mockProcessExit();

    vi.mocked(service.checkFiles).mockReturnValue({
      codeowners: {
        filePath: ".github/CODEOWNERS",
        ruleCount: 1,
        valid: true,
        violations: [],
      },
      valid: false,
      workflows: {
        valid: false,
        violations: [
          {
            file: ".github/workflows/ci.yml",
            job: "build",
            reason: "Missing timeout",
          },
        ],
        workflowsAudited: 7,
      },
    });

    await expect(command.run()).rejects.toThrow("process.exit:1");
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("Discovered workflow governance violations."),
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("handles valid codeowners without explicit filePath and workflow violation without job", async () => {
    expect.hasAssertions();

    const exitSpy = mockProcessExit();

    vi.mocked(service.checkFiles).mockReturnValue({
      codeowners: {
        ruleCount: 2,
        valid: true,
        violations: [],
      },
      valid: false,
      workflows: {
        valid: false,
        violations: [
          {
            file: ".github/workflows/ci.yml",
            reason: "Workflow file syntax error",
          },
        ],
        workflowsAudited: 1,
      },
    });

    await expect(command.run()).rejects.toThrow("process.exit:1");
    expect(logger.log).toHaveBeenCalledWith(
      expect.stringContaining("Verified CODEOWNERS file (valid) with 2 rules."),
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
