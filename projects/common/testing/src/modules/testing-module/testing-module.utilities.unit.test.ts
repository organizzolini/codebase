import { describe, expect, it } from "vitest";

import { LoggerService } from "@codebase/observability";

import { SampleClockModule } from "../../../testing/fixtures/sample-clock.module";
import { SampleClockService } from "../../../testing/fixtures/sample-clock.service";
import { SampleGreeterService } from "../../../testing/fixtures/sample-greeter.service";

import {
  buildTestingModule,
  expectLoggerContext,
} from "./testing-module.utilities";

// 🧪 Tests

describe("testing modules", () => {
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
  });

  describe(expectLoggerContext, () => {
    it("passes for a class that names its logger context after itself", async () => {
      await expect(
        expectLoggerContext(SampleGreeterService, {
          mocks: [SampleClockService],
        }),
      ).resolves.toBeUndefined();
    });

    it("fails for a class that never sets its logger context", async () => {
      await expect(expectLoggerContext(SampleClockService)).rejects.toThrow(
        /setContext/u,
      );
    });
  });
});
