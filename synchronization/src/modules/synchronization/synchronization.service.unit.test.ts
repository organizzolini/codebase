import { createMock } from "@golevelup/ts-vitest";
import { describe, expect, it, vi } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { SynchronizationService } from "./synchronization.service";

import type { LoggerService } from "@codebase/observability";

describe(SynchronizationService, () => {
  it("resolves with its dependencies", async () => {
    expect.hasAssertions();

    const { instance } = await buildTestingModule(SynchronizationService);

    expect(instance).toBeInstanceOf(SynchronizationService);
  });

  it("returns true only for supported synchronization modes", () => {
    const synchronizationService = new SynchronizationService();

    expect(synchronizationService.isSynchronizationMode("check")).toBe(true);
    expect(synchronizationService.isSynchronizationMode("write")).toBe(true);
    expect(synchronizationService.isSynchronizationMode("invalid")).toBe(false);
  });

  it("resolves to default check mode when no argument is passed", () => {
    const service = new SynchronizationService();
    const loggerService = createMock<LoggerService>();

    const mode = service.resolveSynchronizationModeOrExit({
      invalidModeLabel: "Invalid mode",
      loggerService,
      passedParameters: [],
      usageMessage: "Usage",
    });

    expect(mode).toBe("check");
  });

  it("exits the process when mode is invalid", () => {
    const service = new SynchronizationService();
    const loggerService = createMock<LoggerService>();
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit:1");
    });

    expect(() => {
      service.resolveSynchronizationModeOrExit({
        invalidModeLabel: "Invalid mode",
        loggerService,
        passedParameters: ["invalid-mode"],
        usageMessage: "Usage",
      });
    }).toThrow("process.exit:1");
    expect(loggerService.error).toHaveBeenCalledWith(
      "🚦 Rejected an unusable mode",
      undefined,
      {
        mode: "invalid-mode",
        reason: "Invalid mode",
        usage: "Usage",
      },
    );

    processExitSpy.mockRestore();
  });
});
