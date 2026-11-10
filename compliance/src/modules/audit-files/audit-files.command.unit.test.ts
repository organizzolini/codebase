import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { mockProcessExit } from "../../../testing/mocks";

import { AuditFilesCommand } from "./audit-files.command";
import { AuditFilesService } from "./audit-files.service";

import type { LoggerServiceContract } from "@codebase/observability";
import type { TestingModuleOptions } from "@codebase/testing/nestjs";

/** What the AuditFilesCommand is built with. */
const DEPENDENCIES = {
  mocks: [AuditFilesService],
} satisfies TestingModuleOptions;

describe(AuditFilesCommand, () => {
  let command: AuditFilesCommand;
  let service: AuditFilesService;
  let logger: LoggerServiceContract;

  beforeAll(async () => {
    const built = await buildTestingModule(AuditFilesCommand, DEPENDENCIES);

    command = built.instance;
    service = built.mock(AuditFilesService);
    logger = built.logger;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      AuditFilesCommand,
      DEPENDENCIES,
    );

    expect(instance).toBeInstanceOf(AuditFilesCommand);
  });

  it("sets logger context", async () => {
    await expectLoggerContext(AuditFilesCommand, DEPENDENCIES);
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
