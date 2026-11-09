import { Module } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import {
  expectModuleExports,
  expectModuleImports,
  expectModuleProvides,
} from "./module-wiring.utilities";

// 🧪 Tests

class ClockDependency {
  public now(): string {
    return "";
  }
}

@Module({ exports: [ClockDependency], providers: [ClockDependency] })
class ClockModule {}

class GreeterDependency {
  public greet(): string {
    return "";
  }
}

@Module({
  exports: [GreeterDependency],
  imports: [ClockModule],
  providers: [GreeterDependency],
})
class GreeterModule {}

describe("module wiring", () => {
  describe(expectModuleProvides, () => {
    it("passes for providers the module declares", () => {
      expect(() => {
        expectModuleProvides(GreeterModule, GreeterDependency);
      }).not.toThrow();
    });

    it("fails for a provider the module does not declare", () => {
      expect(() => {
        expectModuleProvides(GreeterModule, ClockDependency);
      }).toThrow(/ClockDependency/u);
    });
  });

  describe(expectModuleExports, () => {
    it("passes for providers the module exports", () => {
      expect(() => {
        expectModuleExports(ClockModule, ClockDependency);
      }).not.toThrow();
    });

    it("fails for a provider the module does not export", () => {
      expect(() => {
        expectModuleExports(GreeterModule, ClockDependency);
      }).toThrow(/ClockDependency/u);
    });
  });

  describe(expectModuleImports, () => {
    it("passes for modules the module imports", () => {
      expect(() => {
        expectModuleImports(GreeterModule, ClockModule);
      }).not.toThrow();
    });

    it("fails for a module that declares no imports at all", () => {
      expect(() => {
        expectModuleImports(ClockModule, GreeterModule);
      }).toThrow(/GreeterModule/u);
    });
  });
});
