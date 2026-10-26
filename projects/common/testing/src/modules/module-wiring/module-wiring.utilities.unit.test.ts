import { describe, expect, it } from "vitest";

import { SampleClockModule } from "../../../testing/fixtures/sample-clock.module";
import { SampleClockService } from "../../../testing/fixtures/sample-clock.service";
import { SampleGreeterModule } from "../../../testing/fixtures/sample-greeter.module";
import { SampleGreeterService } from "../../../testing/fixtures/sample-greeter.service";

import {
  expectModuleExports,
  expectModuleImports,
  expectModuleProvides,
} from "./module-wiring.utilities";

// 🧪 Tests

describe("module wiring", () => {
  describe(expectModuleProvides, () => {
    it("passes for providers the module declares", () => {
      expect(() => {
        expectModuleProvides(SampleGreeterModule, SampleGreeterService);
      }).not.toThrow();
    });

    it("fails for a provider the module does not declare", () => {
      expect(() => {
        expectModuleProvides(SampleGreeterModule, SampleClockService);
      }).toThrow(/SampleClockService/u);
    });
  });

  describe(expectModuleExports, () => {
    it("passes for providers the module exports", () => {
      expect(() => {
        expectModuleExports(SampleClockModule, SampleClockService);
      }).not.toThrow();
    });

    it("fails for a provider the module does not export", () => {
      expect(() => {
        expectModuleExports(SampleGreeterModule, SampleClockService);
      }).toThrow(/SampleClockService/u);
    });
  });

  describe(expectModuleImports, () => {
    it("passes for modules the module imports", () => {
      expect(() => {
        expectModuleImports(SampleGreeterModule, SampleClockModule);
      }).not.toThrow();
    });

    it("fails for a module that declares no imports at all", () => {
      expect(() => {
        expectModuleImports(SampleClockModule, SampleGreeterModule);
      }).toThrow(/SampleGreeterModule/u);
    });
  });
});
