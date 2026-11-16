import { describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/observability";

import { SampleClockModule } from "../../../testing/fixtures/sample-clock.module";
import { SampleClockService } from "../../../testing/fixtures/sample-clock.service";
import { SampleGreeterService } from "../../../testing/fixtures/sample-greeter.service";

import {
  buildTestingModule,
  mockErrorLogEntries,
  setErrorLogFilePath,
} from "./testing-module.utilities";

// 🧪 Tests

describe(buildTestingModule, () => {
  it("resolves the class under test with each mock injected in place of the real dependency", async () => {
    const built = await buildTestingModule(SampleGreeterService, {
      mocks: [SampleClockService],
    });
    built.mock(SampleClockService).now.mockReturnValue("dawn");

    expect(built.instance).toBeInstanceOf(SampleGreeterService);
    expect(built.instance.greet("Ovid")).toBe("dawn salve, Ovid");
  });

  it("injects a logger mock by default and hands it back", async () => {
    const built = await buildTestingModule(SampleGreeterService, {
      mocks: [SampleClockService],
    });

    expect(built.logger.setContext).toHaveBeenCalledWith(
      SampleGreeterService.name,
    );
    await expect(built.module.resolve(LoggerService)).resolves.toBe(
      built.logger,
    );
  });

  it("wires real dependencies from the imports and providers it is given", async () => {
    const fromImports = await buildTestingModule(SampleGreeterService, {
      imports: [SampleClockModule],
    });
    const fromProviders = await buildTestingModule(SampleGreeterService, {
      providers: [SampleClockService],
    });

    expect(fromImports.instance.greet("Ovid")).toMatch(/salve, Ovid$/u);
    expect(fromProviders.instance.greet("Ovid")).toMatch(/salve, Ovid$/u);
  });

  it("fails when the class under test has a dependency nothing provides", async () => {
    await expect(buildTestingModule(SampleGreeterService)).rejects.toThrow(
      /SampleClockService/u,
    );
  });

  it("builds timestamped error log lines through mockErrorLogEntries", async () => {
    const { logger } = await buildTestingModule(SampleGreeterService, {
      mocks: [SampleClockService],
    });
    mockErrorLogEntries(logger);
    const error = new Error("boom");

    const entry = logger.buildErrorLogEntry("scope", error);

    expect(entry.errorMessage).toBe(error.stack);
    expect(entry.logLine).toMatch(/^\[.+\] scope: .*boom/su);
    expect(logger.buildErrorLogEntry("scope", "plain").errorMessage).toBe(
      "plain",
    );
  });

  it("overwrites a private readonly errorLogFilePath through setErrorLogFilePath", () => {
    class Sample {
      private readonly errorLogFilePath = "/before.log";

      public read(): string {
        return this.errorLogFilePath;
      }
    }
    const sample = new Sample();

    setErrorLogFilePath(sample, "/after.log");

    expect(sample.read()).toBe("/after.log");
  });
});
