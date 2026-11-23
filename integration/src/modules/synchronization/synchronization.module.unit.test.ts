import { describe, expect, it } from "vitest";

import { LoggerModule } from "@codebase/observability";
import {
  expectModuleImports,
  expectModuleProvides,
} from "@codebase/testing/nestjs";

import { SynchronizationMarkersService } from "./synchronization-markers.service";
import { SynchronizationCommand } from "./synchronization.command";
import { SynchronizationModule } from "./synchronization.module";
import { SynchronizationService } from "./synchronization.service";

describe(SynchronizationModule, () => {
  it("provides the contract services and the aggregate", () => {
    expect.hasAssertions();

    expectModuleImports(SynchronizationModule, LoggerModule);
    expectModuleProvides(
      SynchronizationModule,
      SynchronizationCommand,
      SynchronizationMarkersService,
      SynchronizationService,
    );
  });
});
