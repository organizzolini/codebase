import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { mockProcessExit } from "../../../testing/mocks";

import { AuditGovernanceCommand } from "./audit-governance.command";
import { AuditGovernanceService } from "./audit-governance.service";

const moduleOptions = { mocks: [AuditGovernanceService] };

import type { BuiltTestingModule } from "@codebase/testing/nestjs";

describe(AuditGovernanceCommand, () => {
  let command: AuditGovernanceCommand;
  let service: AuditGovernanceService;
  let logger: BuiltTestingModule<unknown>["logger"];

  beforeAll(async () => {
    const built = await buildTestingModule(
      AuditGovernanceCommand,
      moduleOptions,
    );

    command = built.instance;
    service = built.mock(AuditGovernanceService);
    logger = built.logger;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      AuditGovernanceCommand,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(AuditGovernanceCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(AuditGovernanceCommand, moduleOptions);
  });

  it("logs success and does not exit when governance is valid", async () => {
    expect.hasAssertions();

    const exitSpy = mockProcessExit();

    vi.mocked(service.checkGovernance).mockReturnValue({
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

    vi.mocked(service.checkGovernance).mockReturnValue({
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

    vi.mocked(service.checkGovernance).mockReturnValue({
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

    vi.mocked(service.checkGovernance).mockReturnValue({
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
