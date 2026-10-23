import { createMock } from "@golevelup/ts-vitest";
import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { LoggerService } from "@codebase/observability";

import { ToolsCommand } from "./tools.command";
import { ToolsService } from "./tools.service";

describe(ToolsCommand, () => {
  const install = vi.fn<ToolsService["install"]>();
  let command: ToolsCommand;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ToolsCommand,
        { provide: ToolsService, useValue: { install } },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();

    command = await module.resolve(ToolsCommand);
  });

  it("is defined", () => {
    expect.hasAssertions();
    expect(command).toBeDefined();
  });

  it("sets logger context", async () => {
    expect.hasAssertions();

    const module = await Test.createTestingModule({
      providers: [
        ToolsCommand,
        { provide: ToolsService, useValue: { install } },
        { provide: LoggerService, useValue: createMock<LoggerService>() },
      ],
    }).compile();
    const logger = await module.resolve(LoggerService);

    expect(logger.setContext).toHaveBeenCalledWith("ToolsCommand");
  });

  it("installs the tools named on the command line", async () => {
    expect.hasAssertions();

    await command.run(["gitleaks", "trivy"]);

    expect(install).toHaveBeenCalledWith(["gitleaks", "trivy"]);
  });
});
