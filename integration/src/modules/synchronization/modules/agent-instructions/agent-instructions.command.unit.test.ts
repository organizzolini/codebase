import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { expectLoggerContext } from "@codebase/observability/testing";
import { expectProcessExitOne, mockProcessExit } from "@codebase/testing";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { SynchronizationService } from "../../synchronization.service";

import { AgentInstructionsCommand } from "./agent-instructions.command";
import { AgentInstructionsService } from "./agent-instructions.service";

import type { BuiltTestingModule } from "@codebase/testing/nestjs";

const moduleOptions = {
  mocks: [AgentInstructionsService],
  providers: [SynchronizationService],
};

describe(AgentInstructionsCommand, () => {
  let command: AgentInstructionsCommand;
  let logger: BuiltTestingModule<unknown>["logger"];
  let service: AgentInstructionsService;

  beforeAll(async () => {
    const built = await buildTestingModule(
      AgentInstructionsCommand,
      moduleOptions,
    );

    command = built.instance;
    logger = built.logger;
    service = built.mock(AgentInstructionsService);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(service.linkProjects).mockReturnValue({ refused: [] });
  });

  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(
      AgentInstructionsCommand,
      moduleOptions,
    );

    expect(instance).toBeInstanceOf(AgentInstructionsCommand);
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    await expectLoggerContext(AgentInstructionsCommand, moduleOptions);
  });

  it("verifies when every project is linked, in either mode", async () => {
    expect.hasAssertions();

    vi.mocked(service.findUnlinkedProjects).mockReturnValue([]);

    await expect(command.synchronize("check")).resolves.toBe(true);
    await expect(command.synchronize("write")).resolves.toBe(true);

    expect(service.linkProjects).not.toHaveBeenCalled();
  });

  it("fails a check and names the projects without writing", async () => {
    expect.hasAssertions();

    vi.mocked(service.findUnlinkedProjects).mockReturnValue(["compliance"]);

    await expect(command.synchronize("check")).resolves.toBe(false);

    expect(service.linkProjects).not.toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith(
      "🔗 Detected projects with no CLAUDE.md link",
      undefined,
      expect.objectContaining({ projects: ["compliance"] }),
    );
  });

  it("links the projects in write mode", async () => {
    expect.hasAssertions();

    vi.mocked(service.findUnlinkedProjects).mockReturnValue(["compliance"]);

    await expect(command.synchronize("write")).resolves.toBe(true);

    expect(service.linkProjects).toHaveBeenCalledWith(expect.any(String), [
      "compliance",
    ]);
  });

  it("fails a write that had to refuse a regular file", async () => {
    expect.hasAssertions();

    vi.mocked(service.findUnlinkedProjects).mockReturnValue(["compliance"]);
    vi.mocked(service.linkProjects).mockReturnValue({
      refused: ["compliance"],
    });

    await expect(command.synchronize("write")).resolves.toBe(false);

    expect(logger.error).toHaveBeenCalledWith(
      "🚧 Refused to replace a CLAUDE.md that is a regular file",
      undefined,
      { projects: ["compliance"] },
    );
  });

  it("exits non-zero when run in check mode with a missing link", async () => {
    expect.hasAssertions();

    vi.mocked(service.findUnlinkedProjects).mockReturnValue(["compliance"]);

    const processExitSpy = mockProcessExit();

    await expectProcessExitOne(async () => command.run(["check"]));

    processExitSpy.mockRestore();
  });

  it("tells the user to run the write target as the fix", () => {
    expect(command.synchronizationLabel).toBe("agent-instructions");
    expect(command.fixCommand).toBe(
      "pnpm exec nx run integration:agent-instructions:write",
    );
  });
});
